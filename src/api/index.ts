import { Api, HttpResponse, FullRequestParams, ApiError } from "./consoleApi";

export const ServerHost = "http://localhost:8001";
export let api = new Api();
api.baseUrl = ServerHost;
const internalRequestFunc = api.request;
api.request = async <T = any, E = any>({
  body,
  secure,
  path,
  type,
  query,
  format,
  baseUrl,
  cancelToken,
  ...params
}: FullRequestParams): Promise<HttpResponse<T, E>> => {
  const internalResp = internalRequestFunc({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params,
  });
  return internalResp.then((e) => CommonAPIValidation(e));
};

export function CommonAPIValidation<D, E>(
  res: HttpResponse<D, E>,
): HttpResponse<D, E> {
  const err = res.error as ApiError;
  if (err && res.status === 403 && err.msg === "invalid session") {
    if (window.location.pathname !== "/login") {
      document.location = "/login";
    }
  }
  return res;
}
