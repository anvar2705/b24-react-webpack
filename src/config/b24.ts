/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-param-reassign */
import { getQueryString } from './b24.utils';

export default new (class BX24API {
  constructor() {
    this.auth();
    const urlParams = new URLSearchParams(window.location.search);
    this.baseUrl = `https://${urlParams.get('DOMAIN')}`;
  }

  baseUrl: string;

  session: any;

  // eslint-disable-next-line consistent-return
  async auth() {
    if (this.session?.ACCESS_TOKEN) return this.session;
    // @ts-ignore
    BX24.init(async () => {
      // @ts-ignore
      this.session = await BX24.getAuth();
      return this.session;
    });
  }

  async callMethod(name: string, params: any = {}) {
    await this.auth();
    // eslint-disable-next-line no-param-reassign
    params.auth = this.session.access_token;

    const queryString = getQueryString(params);

    const result = await fetch(`${this.baseUrl}/rest/${name}?`, {
      method: 'POST',
      body: queryString,
    });

    return result.json();
  }

  async getAll(name: string, params: any = {}) {
    const response = await this.callMethod(name, params);

    if (response.result.length < response.next) {
      return response;
    }

    for (let i = 1; i < Math.ceil(response.total / response.next); i++) {
      params.start = i * response.next;
      // eslint-disable-next-line no-await-in-loop
      const tmpResponse = await this.callMethod(name, params);
      response.result = [...response.result, ...tmpResponse.result];
    }
    return response;
  }
})();
