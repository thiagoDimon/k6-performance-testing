import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getEmpresaDuration = new Trend('get_empresa', true);
export const rateStatusOkEmpresa = new Rate('status_ok_empresa', true);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '25s', target: 50 },
    { duration: '30s', target: 120 },
    { duration: '25s', target: 120 },
    { duration: '30s', target: 220 },
    { duration: '25s', target: 220 },
    { duration: '30s', target: 300 },
    { duration: '25s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://www.ateky.com.br/empresa/';

  const params = {
    headers: {
      'Content-Type': 'text/html'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getEmpresaDuration.add(res.timings.duration);
  rateStatusOkEmpresa.add(res.status === OK);

  check(res, {
    'GET Empresa - Status 200': () => res.status === OK
  });
}
