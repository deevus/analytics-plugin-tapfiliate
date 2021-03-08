import { AnalyticsPlugin } from 'analytics';

export function scriptLoaded(scriptSrc: string) {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[src]');

  return Array.from(scripts).some((script) => script.src === scriptSrc);
}

export function insertScript(scriptSrc: string) {
  const scriptElement = document.createElement('script');
  scriptElement.src = scriptSrc;
  scriptElement.async = true;
  scriptElement.type = 'text/javascript';

  document.head.appendChild(scriptElement);
}

export function insertScriptIfNotPresent(scriptSrc: string) {
  if (!scriptLoaded(scriptSrc)) {
    insertScript(scriptSrc);
  }
}


interface TapStatic {
  (action: 'create', tapfiliateId: string, options: Record<string, string>): void;
  (action: 'detect'): void;
  loaded?: boolean;
  q?: IArguments[];
}

declare global {
  interface Window {
    tap?: TapStatic;
    TapfiliateObject?: string;
  }
}

export interface TapfiliatePluginConfig {
  tapfiliateId?: string;
}

export type TapfiliatePluginArgs = TapfiliatePluginConfig;

const tapfiliatePlugin = ({ tapfiliateId }: TapfiliatePluginConfig): AnalyticsPlugin => {
  const sharedConfig = {
    name: 'tapfiliate-plugin',
    config: {
      tapfiliateId,
    },
  };

  if (process.env.BROWSER) {
    return {
      ...sharedConfig,

      initialize({ config }: { config: TapfiliatePluginConfig }) {
        if (!config.tapfiliateId) throw new Error('No Tapfiliate tapfiliateId defined');

        const scriptSrc = 'https://script.tapfiliate.com/tapfiliate.js';

        insertScriptIfNotPresent(scriptSrc);

        (function(window: Window, tapKey: 'tap') {
          window['TapfiliateObject'] = tapKey;

          window[tapKey] = window[tapKey] || function () {
            const queue = (window[tapKey] as TapStatic).q = window[tapKey]?.q || [];

            queue.push(arguments);
          }
        })(window, 'tap');

        window.tap?.('create', config.tapfiliateId, {
          integration: 'javascript',
        });
        window.tap?.('detect');
      },

      loaded() {
        return window.tap?.loaded ?? false;
      }
    };
  } else {
    return sharedConfig;
  }
}

export default tapfiliatePlugin;
