import { SmartAPI } from 'smartapi-javascript';

export const initSmartApi = () => {
  let smart_api = new SmartAPI({
    api_key: 'C9QmpRTC', // PROVIDE YOUR API KEY HERE
    // OPTIONAL : If user has valid access token and refresh token then it can be directly passed to the constructor.
    // access_token: "YOUR_ACCESS_TOKEN",
    // refresh_token: "YOUR_REFRESH_TOKEN"
  });
};
