<!--
title: Adding Tapfiliate to your app using open source analytics
description: Connect Tapfiliate to the analytics library
pageTitle: Tapfiliate
-->

# Tapfiliate

This library exports the `tapfiliate` plugin for the [`analytics`](https://www.npmjs.com/package/analytics) package & standalone methods for any project to use to make it easier to interact with [Tapfiliate](https://tapfiliate.com/).

This analytics plugin will load Tapfiliate into your application.

## Installation

```bash
npm install analytics
npm install analytics-plugin-tapfiliate
```

## How to use

```typescript
import Analytics from 'analytics'
import tapfiliate from 'analytics-plugin-tapfiliate'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    tapfiliate({
      tapfiliateId: '1234' // required
      customerType: 'customer', // optional. can be customer, trial or lead (default: customer)
      cookieDomain: 'www.example.com', //optional (default: none)
      referralCodeParam: 'ref' // optional (default: ref)
    })
  ]
})
```

For more information view the [Tapfiliate documentation](https://tapfiliate.com/docs/javascript/)

## Registering a conversion

Registering a conversion is via a custom method

```typescript
analytics.plugins.tapfiliate.conversion(externalId, amount);
```
