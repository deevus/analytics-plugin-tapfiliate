import { AnalyticsPlugin, AnalyticsInstance } from 'analytics';

export function scriptLoaded(scriptSrc: string): boolean {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[src]');

  return Array.from(scripts).some((script) => script.src === scriptSrc);
}

export function insertScript(scriptSrc: string): void {
  const scriptElement = document.createElement('script');
  scriptElement.src = scriptSrc;
  scriptElement.async = true;
  scriptElement.type = 'text/javascript';

  document.head.appendChild(scriptElement);
}

export function insertScriptIfNotPresent(scriptSrc: string): void {
  if (!scriptLoaded(scriptSrc)) {
    insertScript(scriptSrc);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Metadata = Record<string, any>;

interface TapStatic {
  (action: 'create', tapfiliateId: string, options: Record<string, string>): void;
  (action: 'detect', options?: {
    cookie_domain?: string;
    referral_code_param?: string;
  }): void;
  (action: 'customer' | 'trial' | 'lead', userId: string, options?: {
    meta_data?: Metadata;
  }): void;
  (action: 'conversion', externalId?: string, amount?: number, options?: {
    meta_data?: Metadata;
    customer_id?: string;
    currency?: string;
  }, commissionType?: string): void;
  loaded?: boolean;
  q?: IArguments[];
}

declare global {
  interface Window {
    tap: TapStatic;
    TapfiliateObject?: string;
  }
}

export interface TapfiliatePluginConfig {
  tapfiliateId?: string;
  customerType?: 'customer' | 'trial' | 'lead';
  cookieDomain?: string;
  referralCodeParam?: string;
}

interface Params {
  payload: {
    userId: string;
    traits: Metadata;
  };
  config: TapfiliatePluginConfig;
}

const tapfiliatePlugin = (config: TapfiliatePluginConfig): AnalyticsPlugin => {
  const sharedConfig = {
    name: 'tapfiliate',
    config,
  };

  if (process.env.BROWSER) {
    return {
      ...sharedConfig,

      initialize({ config }: { config: TapfiliatePluginConfig }): void {
        if (!config.tapfiliateId) throw new Error('No Tapfiliate tapfiliateId defined');

        const scriptSrc = 'https://script.tapfiliate.com/tapfiliate.js';

        insertScriptIfNotPresent(scriptSrc);

        (function(window: Window, tapKey: 'tap') {
          window['TapfiliateObject'] = tapKey;

          window[tapKey] = window[tapKey] || function () {
            const queue = (window[tapKey] as TapStatic).q = window[tapKey]?.q || [];

            // eslint-disable-next-line prefer-rest-params
            queue.push(arguments);
          }
        })(window, 'tap');

        window.tap('create', config.tapfiliateId, {
          integration: 'javascript',
        });
      },

      ready({ config }: Params) {
        window.tap('detect', {
          cookie_domain: config.cookieDomain,
          referral_code_param: config.referralCodeParam,
        });
      },

      identify({ payload, config }: Params): void {
        const { userId } = payload;

        window.tap(config.customerType ?? 'customer', userId, {
          meta_data: payload.traits,
        });
      },

      loaded() {
        return window.tap?.loaded ?? false;
      },

      methods: {
        conversion(this: { instance: AnalyticsInstance }, externalId?: string, amount?: number) {
          const { traits } = this.instance.user();

          window.tap('conversion', externalId, amount, {
            meta_data: traits,
          });
        },
      },
    };
  } else {
    return sharedConfig;
  }
}

export default tapfiliatePlugin;
