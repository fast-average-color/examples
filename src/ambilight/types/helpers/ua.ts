const ua = navigator.userAgent.toLowerCase();
export const isFirefox = ua.indexOf('firefox') > -1;
export const isSafari = (ua.search('safari') > -1 && ua.search('chrome') === -1);
