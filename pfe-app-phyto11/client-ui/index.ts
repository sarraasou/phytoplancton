/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface UserCreateInput {
  deletedAt?: object;
  firstName?: string;
  lastName?: string;
  username: string;
  isValid?: boolean;
  roles: string[];
  userRole?: string;
}

export interface AiModel {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  name: string;
  type: string;
  annotations?: Annotation[];
}

export interface Image {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  name: string;
  project: Project;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  aimodel: AiModel;
  image: Image;
  validatedBy?: User;
}

export interface Collaborator {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  user: User;
  project: Project;
}

export interface User {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  firstName?: string;
  lastName?: string;
  username: string;
  isValid?: boolean;
  roles: string[];
  projects?: Project[];
  annotations?: Annotation[];
  userRole?: string;
  collaborators?: Collaborator[];
}

export interface Project {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  title: string;
  description?: string;
  tool?: string;
  user?: User;
  images?: Image[];
  collaborators?: Collaborator[];
}

export interface ForbiddenException {
  statusCode: number;
  message: string;
}

export interface StringFilter {
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "Default" | "Insensitive";
  not?: string;
}

export interface StringNullableFilter {
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "Default" | "Insensitive";
  not?: string;
}

export interface UserWhereInput {
  id?: StringFilter;
  firstName?: StringNullableFilter;
  lastName?: StringNullableFilter;
  username?: StringFilter;
  userRole?: StringNullableFilter;
}

export interface UserOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  firstName?: "Asc" | "Desc";
  lastName?: "Asc" | "Desc";
  username?: "Asc" | "Desc";
  isValid?: "Asc" | "Desc";
  roles?: "Asc" | "Desc";
  userRole?: "Asc" | "Desc";
}

export interface GetListUserDto {
  paginatedResult: User[];
  totalCount: number;
}

export interface FileDto {
  file: string;
}

export interface NotFoundException {
  statusCode: number;
  message: string;
}

export interface UserUpdateInput {
  deletedAt?: object;
  firstName?: string;
  lastName?: string;
  username?: string;
  isValid?: boolean;
  roles?: string[];
  userRole?: string;
}

export type UpdatePasswordDTO = object;

export interface UserWhereUniqueInput {
  id: string;
}

export interface AiModelWhereUniqueInput {
  id: string;
}

export interface ImageWhereUniqueInput {
  id: string;
}

export interface ProjectWhereUniqueInput {
  id: string;
}

export interface UserCredentials {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface EmailResetPasswordCredential {
  email: string;
}

export interface ResetPasswordCredential {
  access_token: string;
  password: string;
}

export interface GenerateLinkOptions {
  redirectTo?: string;
  password?: string;
  data?: object;
}

export interface InviteUserByEmailCredential {
  email: string;
  options?: GenerateLinkOptions;
}

export interface ResetEmailCredential {
  userId: string;
  email: string;
  password: string;
}

export interface AppConfigCreateInput {
  deletedAt?: object;
  value?: string;
  key?: string;
}

export interface AppConfig {
  id: string;
  /** @format date-time */
  createdAt: string;
  updatedAt?: object;
  deletedAt?: object;
  value?: string;
  key?: string;
}

export interface AppConfigWhereInput {
  id?: StringFilter;
  value?: StringNullableFilter;
  key?: StringNullableFilter;
}

export interface AppConfigOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  value?: "Asc" | "Desc";
  key?: "Asc" | "Desc";
}

export interface GetListAppConfigDto {
  paginatedResult: AppConfig[];
  totalCount: number;
}

export interface AppConfigUpdateInput {
  deletedAt?: object;
  value?: string;
  key?: string;
}

export interface ImageCreateInput {
  deletedAt?: object;
  name: string;
  url: string;
  project: ProjectWhereUniqueInput;
}

export interface ProjectCreateInput {
  deletedAt?: object;
  title: string;
  description?: string;
  tool?: string;
  user?: UserWhereUniqueInput;
  images: ImageCreateInput[];
}

export interface ProjectWhereInput {
  id?: StringFilter;
  title?: StringFilter;
  description?: StringNullableFilter;
  tool?: StringNullableFilter;
  user?: UserWhereUniqueInput;
}

export interface ProjectOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  title?: "Asc" | "Desc";
  description?: "Asc" | "Desc";
  tool?: "Asc" | "Desc";
  userId?: "Asc" | "Desc";
}

export interface GetListProjectDto {
  paginatedResult: Project[];
  totalCount: number;
}

export interface ProjectUpdateInput {
  deletedAt?: object;
  title?: string;
  description?: string;
  tool?: string;
  user?: UserWhereUniqueInput;
}

export interface ImageWhereInput {
  id?: StringFilter;
  name?: StringFilter;
  project?: ProjectWhereUniqueInput;
}

export interface ImageOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  name?: "Asc" | "Desc";
  projectId?: "Asc" | "Desc";
}

export interface GetListImageDto {
  paginatedResult: Image[];
  totalCount: number;
}

export interface ImageUpdateInput {
  deletedAt?: object;
  name?: string;
  project?: ProjectWhereUniqueInput;
}

export interface AiModelCreateInput {
  deletedAt?: object;
  name: string;
  type: string;
}

export interface AiModelWhereInput {
  id?: StringFilter;
  name?: StringFilter;
  type?: StringFilter;
}

export interface AiModelOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  name?: "Asc" | "Desc";
  type?: "Asc" | "Desc";
}

export interface GetListAiModelDto {
  paginatedResult: AiModel[];
  totalCount: number;
}

export interface AiModelUpdateInput {
  deletedAt?: object;
  name?: string;
  type?: string;
}

export interface AnnotationCreateInput {
  deletedAt?: object;
  aimodel: AiModelWhereUniqueInput;
  image: ImageWhereUniqueInput;
  validatedBy?: UserWhereUniqueInput;
}

export interface AnnotationWhereInput {
  id?: StringFilter;
  aimodel?: AiModelWhereUniqueInput;
  image?: ImageWhereUniqueInput;
  validatedBy?: UserWhereUniqueInput;
}

export interface AnnotationOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  aimodelId?: "Asc" | "Desc";
  imageId?: "Asc" | "Desc";
  validatedById?: "Asc" | "Desc";
}

export interface GetListAnnotationDto {
  paginatedResult: Annotation[];
  totalCount: number;
}

export interface AnnotationUpdateInput {
  deletedAt?: object;
  aimodel?: AiModelWhereUniqueInput;
  image?: ImageWhereUniqueInput;
  validatedBy?: UserWhereUniqueInput;
}

export interface CollaboratorCreateInput {
  deletedAt?: object;
  user: UserWhereUniqueInput;
  project: ProjectWhereUniqueInput;
}

export interface CollaboratorWhereInput {
  id?: StringFilter;
  user?: UserWhereUniqueInput;
  project?: ProjectWhereUniqueInput;
}

export interface CollaboratorOrderByInput {
  id?: "Asc" | "Desc";
  createdAt?: "Asc" | "Desc";
  updatedAt?: "Asc" | "Desc";
  deletedAt?: "Asc" | "Desc";
  userId?: "Asc" | "Desc";
  projectId?: "Asc" | "Desc";
}

export interface GetListCollaboratorDto {
  paginatedResult: Collaborator[];
  totalCount: number;
}

export interface CollaboratorUpdateInput {
  deletedAt?: object;
  user?: UserWhereUniqueInput;
  project?: ProjectWhereUniqueInput;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;

  key?: string;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
  handleError?: void;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/nest";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);
  private handleError?: (() => void | undefined) | undefined;

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  public setBaseApiParams = (data: RequestParams) => {
    this.baseApiParams = {
      credentials: "same-origin",
      headers: {},
      redirect: "follow",
      referrerPolicy: "no-referrer",
      ...data,
      headers: {
        ...(data.headers || {}),
      },
    };
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<
    ContentType,
    (input: any, requestParam: any) => any
  > = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any, requestParam) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          requestParam?.key || key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
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
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;
    const resp = await this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
          ...(requestParams.headers || {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body, requestParams),
      },
    );
    if (cancelToken) {
      this.abortControllers.delete(cancelToken);
    }
    let data: T;
    let error: E;
    try {
      data = await resp[responseFormat || "json"]();
      if (!resp.ok) {
        if (data?.error?.statusCode === 401) this.handleError?.();
        throw { ...resp, error: data };
      } else return { ...resp, data, error };
    } catch (error) {
      if (error?.error?.statusCode) throw error;
      console.log(error);
    }
  };
}

/**
 * @title My app-2
 * @version v08nzqqb
 * @baseUrl /nest
 * @contact
 *
 *
 *
 * ## Congratulations! Your application is ready.
 *
 *     Please note that all endpoints are secured with JWT Bearer authentication.Use the authentification service of supabase to authenticate.
 *     (https://supabase.com/docs/gotrue/server/about#put-user)
 *     Learn more in [our docs](https://docs.amplication.com)
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  nest = {
    /**
     * No description
     *
     * @tags users
     * @name UserControllerCreate
     * @request POST:/nest/api/users
     * @secure
     */
    userControllerCreate: (data: UserCreateInput, params: RequestParams = {}) =>
      this.request<User, ForbiddenException>({
        path: `/nest/api/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerFindMany
     * @request GET:/nest/api/users
     * @secure
     */
    userControllerFindMany: (
      query?: {
        where?: UserWhereInput;
        orderBy?: UserOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListUserDto, void>({
        path: `/nest/api/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerFindDataForExcel
     * @request GET:/nest/api/users/fileExcel
     * @secure
     */
    userControllerFindDataForExcel: (
      params: RequestParams = {},
      query: object,
    ) =>
      this.request<FileDto, void>({
        path: `/nest/api/users/fileExcel`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerFindOne
     * @request GET:/nest/api/users/{id}
     * @secure
     */
    userControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<User, ForbiddenException | NotFoundException>({
        path: `/nest/api/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdate
     * @request PATCH:/nest/api/users/{id}
     * @secure
     */
    userControllerUpdate: (
      id: string,
      data: UserUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<User, ForbiddenException | NotFoundException>({
        path: `/nest/api/users/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerDelete
     * @request DELETE:/nest/api/users/{id}
     * @secure
     */
    userControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<User, ForbiddenException | NotFoundException>({
        path: `/nest/api/users/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdatePassword
     * @request PATCH:/nest/api/users/{id}/resetPassword
     * @secure
     */
    userControllerUpdatePassword: (
      id: string,
      data: UpdatePasswordDTO,
      params: RequestParams = {},
    ) =>
      this.request<User, ForbiddenException | NotFoundException>({
        path: `/nest/api/users/${id}/resetPassword`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerFindManyProjects
     * @request GET:/nest/api/users/{id}/projects
     * @secure
     */
    userControllerFindManyProjects: (
      id: string,
      query?: {
        id?: StringFilter;
        title?: StringFilter;
        description?: StringNullableFilter;
        tool?: StringNullableFilter;
        user?: UserWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/projects`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerCreateProjects
     * @request POST:/nest/api/users/{id}/projects
     * @secure
     */
    userControllerCreateProjects: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/projects`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdateProjects
     * @request PATCH:/nest/api/users/{id}/projects
     * @secure
     */
    userControllerUpdateProjects: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/projects`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerDeleteProjects
     * @request DELETE:/nest/api/users/{id}/projects
     * @secure
     */
    userControllerDeleteProjects: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/projects`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerFindManyAnnotations
     * @request GET:/nest/api/users/{id}/annotations
     * @secure
     */
    userControllerFindManyAnnotations: (
      id: string,
      query?: {
        id?: StringFilter;
        aimodel?: AiModelWhereUniqueInput;
        image?: ImageWhereUniqueInput;
        validatedBy?: UserWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/annotations`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerCreateAnnotations
     * @request POST:/nest/api/users/{id}/annotations
     * @secure
     */
    userControllerCreateAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/annotations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdateAnnotations
     * @request PATCH:/nest/api/users/{id}/annotations
     * @secure
     */
    userControllerUpdateAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/annotations`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerDeleteAnnotations
     * @request DELETE:/nest/api/users/{id}/annotations
     * @secure
     */
    userControllerDeleteAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/annotations`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerFindManyCollaborators
     * @request GET:/nest/api/users/{id}/collaborators
     * @secure
     */
    userControllerFindManyCollaborators: (
      id: string,
      query?: {
        id?: StringFilter;
        user?: UserWhereUniqueInput;
        project?: ProjectWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/collaborators`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerCreateCollaborators
     * @request POST:/nest/api/users/{id}/collaborators
     * @secure
     */
    userControllerCreateCollaborators: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/collaborators`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerUpdateCollaborators
     * @request PATCH:/nest/api/users/{id}/collaborators
     * @secure
     */
    userControllerUpdateCollaborators: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/collaborators`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UserControllerDeleteCollaborators
     * @request DELETE:/nest/api/users/{id}/collaborators
     * @secure
     */
    userControllerDeleteCollaborators: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/users/${id}/collaborators`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerSignUp
     * @request POST:/nest/api/sign_up
     */
    authControllerSignUp: (data: UserCredentials, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/nest/api/sign_up`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerSignIn
     * @request POST:/nest/api/sign_in
     */
    authControllerSignIn: (data: Credentials, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/nest/api/sign_in`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerRoot
     * @request GET:/nest/api/template_email_recovery
     */
    authControllerRoot: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/nest/api/template_email_recovery`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerSendEmailResetPassword
     * @request POST:/nest/api/send_email_reset_password
     */
    authControllerSendEmailResetPassword: (
      data: EmailResetPasswordCredential,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/send_email_reset_password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerResetPassword
     * @request POST:/nest/api/reset_password
     */
    authControllerResetPassword: (
      data: ResetPasswordCredential,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/reset_password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerInviteUserByEmail
     * @request POST:/nest/api/invite_user_by_email
     */
    authControllerInviteUserByEmail: (
      data: InviteUserByEmailCredential,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/invite_user_by_email`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerChangeEmail
     * @request POST:/nest/api/change_email
     */
    authControllerChangeEmail: (
      data: ResetEmailCredential,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/change_email`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags app-configs
     * @name AppConfigControllerCreate
     * @request POST:/nest/api/app-configs
     * @secure
     */
    appConfigControllerCreate: (
      data: AppConfigCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<AppConfig, ForbiddenException>({
        path: `/nest/api/app-configs`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags app-configs
     * @name AppConfigControllerFindMany
     * @request GET:/nest/api/app-configs
     * @secure
     */
    appConfigControllerFindMany: (
      query?: {
        where?: AppConfigWhereInput;
        orderBy?: AppConfigOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListAppConfigDto, void>({
        path: `/nest/api/app-configs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags app-configs
     * @name AppConfigControllerFindDataForExcel
     * @request GET:/nest/api/app-configs/fileExcel
     * @secure
     */
    appConfigControllerFindDataForExcel: (params: RequestParams = {}) =>
      this.request<FileDto, ForbiddenException>({
        path: `/nest/api/app-configs/fileExcel`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags app-configs
     * @name AppConfigControllerFindOne
     * @request GET:/nest/api/app-configs/{id}
     * @secure
     */
    appConfigControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<AppConfig, ForbiddenException | NotFoundException>({
        path: `/nest/api/app-configs/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags app-configs
     * @name AppConfigControllerUpdate
     * @request PATCH:/nest/api/app-configs/{id}
     * @secure
     */
    appConfigControllerUpdate: (
      id: string,
      data: AppConfigUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<AppConfig, ForbiddenException | NotFoundException>({
        path: `/nest/api/app-configs/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags app-configs
     * @name AppConfigControllerDelete
     * @request DELETE:/nest/api/app-configs/{id}
     * @secure
     */
    appConfigControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<AppConfig, ForbiddenException | NotFoundException>({
        path: `/nest/api/app-configs/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerCreate
     * @request POST:/nest/api/projects
     * @secure
     */
    projectControllerCreate: (
      data: ProjectCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<Project, ForbiddenException>({
        path: `/nest/api/projects`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerFindMany
     * @request GET:/nest/api/projects
     * @secure
     */
    projectControllerFindMany: (
      query?: {
        where?: ProjectWhereInput;
        orderBy?: ProjectOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListProjectDto, void>({
        path: `/nest/api/projects`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerFindDataForExcel
     * @request GET:/nest/api/projects/fileExcel
     * @secure
     */
    projectControllerFindDataForExcel: (params: RequestParams = {}) =>
      this.request<FileDto, ForbiddenException>({
        path: `/nest/api/projects/fileExcel`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerFindOne
     * @request GET:/nest/api/projects/{id}
     * @secure
     */
    projectControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Project, ForbiddenException | NotFoundException>({
        path: `/nest/api/projects/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerUpdate
     * @request PATCH:/nest/api/projects/{id}
     * @secure
     */
    projectControllerUpdate: (
      id: string,
      data: ProjectUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<Project, ForbiddenException | NotFoundException>({
        path: `/nest/api/projects/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerDelete
     * @request DELETE:/nest/api/projects/{id}
     * @secure
     */
    projectControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<Project, ForbiddenException | NotFoundException>({
        path: `/nest/api/projects/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerFindManyImages
     * @request GET:/nest/api/projects/{id}/images
     * @secure
     */
    projectControllerFindManyImages: (
      id: string,
      query?: {
        id?: StringFilter;
        name?: StringFilter;
        project?: ProjectWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/images`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerCreateImages
     * @request POST:/nest/api/projects/{id}/images
     * @secure
     */
    projectControllerCreateImages: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/images`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerUpdateImages
     * @request PATCH:/nest/api/projects/{id}/images
     * @secure
     */
    projectControllerUpdateImages: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/images`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerDeleteImages
     * @request DELETE:/nest/api/projects/{id}/images
     * @secure
     */
    projectControllerDeleteImages: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/images`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerFindManyCollaborators
     * @request GET:/nest/api/projects/{id}/collaborators
     * @secure
     */
    projectControllerFindManyCollaborators: (
      id: string,
      query?: {
        id?: StringFilter;
        user?: UserWhereUniqueInput;
        project?: ProjectWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/collaborators`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerCreateCollaborators
     * @request POST:/nest/api/projects/{id}/collaborators
     * @secure
     */
    projectControllerCreateCollaborators: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/collaborators`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerUpdateCollaborators
     * @request PATCH:/nest/api/projects/{id}/collaborators
     * @secure
     */
    projectControllerUpdateCollaborators: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/collaborators`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags projects
     * @name ProjectControllerDeleteCollaborators
     * @request DELETE:/nest/api/projects/{id}/collaborators
     * @secure
     */
    projectControllerDeleteCollaborators: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/projects/${id}/collaborators`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerCreate
     * @request POST:/nest/api/images
     * @secure
     */
    imageControllerCreate: (
      data: ImageCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<Image, ForbiddenException>({
        path: `/nest/api/images`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerFindMany
     * @request GET:/nest/api/images
     * @secure
     */
    imageControllerFindMany: (
      query?: {
        where?: ImageWhereInput;
        orderBy?: ImageOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListImageDto, void>({
        path: `/nest/api/images`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerFindDataForExcel
     * @request GET:/nest/api/images/fileExcel
     * @secure
     */
    imageControllerFindDataForExcel: (params: RequestParams = {}) =>
      this.request<FileDto, ForbiddenException>({
        path: `/nest/api/images/fileExcel`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerFindOne
     * @request GET:/nest/api/images/{id}
     * @secure
     */
    imageControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Image, ForbiddenException | NotFoundException>({
        path: `/nest/api/images/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerUpdate
     * @request PATCH:/nest/api/images/{id}
     * @secure
     */
    imageControllerUpdate: (
      id: string,
      data: ImageUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<Image, ForbiddenException | NotFoundException>({
        path: `/nest/api/images/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerDelete
     * @request DELETE:/nest/api/images/{id}
     * @secure
     */
    imageControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<Image, ForbiddenException | NotFoundException>({
        path: `/nest/api/images/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerFindManyAnnotations
     * @request GET:/nest/api/images/{id}/annotations
     * @secure
     */
    imageControllerFindManyAnnotations: (
      id: string,
      query?: {
        id?: StringFilter;
        aimodel?: AiModelWhereUniqueInput;
        image?: ImageWhereUniqueInput;
        validatedBy?: UserWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/images/${id}/annotations`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerCreateAnnotations
     * @request POST:/nest/api/images/{id}/annotations
     * @secure
     */
    imageControllerCreateAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/images/${id}/annotations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerUpdateAnnotations
     * @request PATCH:/nest/api/images/{id}/annotations
     * @secure
     */
    imageControllerUpdateAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/images/${id}/annotations`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags images
     * @name ImageControllerDeleteAnnotations
     * @request DELETE:/nest/api/images/{id}/annotations
     * @secure
     */
    imageControllerDeleteAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/images/${id}/annotations`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerCreate
     * @request POST:/nest/api/ai-models
     * @secure
     */
    aiModelControllerCreate: (
      data: AiModelCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<AiModel, ForbiddenException>({
        path: `/nest/api/ai-models`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerFindMany
     * @request GET:/nest/api/ai-models
     * @secure
     */
    aiModelControllerFindMany: (
      query?: {
        where?: AiModelWhereInput;
        orderBy?: AiModelOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListAiModelDto, void>({
        path: `/nest/api/ai-models`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerFindDataForExcel
     * @request GET:/nest/api/ai-models/fileExcel
     * @secure
     */
    aiModelControllerFindDataForExcel: (params: RequestParams = {}) =>
      this.request<FileDto, ForbiddenException>({
        path: `/nest/api/ai-models/fileExcel`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerFindOne
     * @request GET:/nest/api/ai-models/{id}
     * @secure
     */
    aiModelControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<AiModel, ForbiddenException | NotFoundException>({
        path: `/nest/api/ai-models/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerUpdate
     * @request PATCH:/nest/api/ai-models/{id}
     * @secure
     */
    aiModelControllerUpdate: (
      id: string,
      data: AiModelUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<AiModel, ForbiddenException | NotFoundException>({
        path: `/nest/api/ai-models/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerDelete
     * @request DELETE:/nest/api/ai-models/{id}
     * @secure
     */
    aiModelControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<AiModel, ForbiddenException | NotFoundException>({
        path: `/nest/api/ai-models/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerFindManyAnnotations
     * @request GET:/nest/api/ai-models/{id}/annotations
     * @secure
     */
    aiModelControllerFindManyAnnotations: (
      id: string,
      query?: {
        id?: StringFilter;
        aimodel?: AiModelWhereUniqueInput;
        image?: ImageWhereUniqueInput;
        validatedBy?: UserWhereUniqueInput;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/ai-models/${id}/annotations`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerCreateAnnotations
     * @request POST:/nest/api/ai-models/{id}/annotations
     * @secure
     */
    aiModelControllerCreateAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/ai-models/${id}/annotations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerUpdateAnnotations
     * @request PATCH:/nest/api/ai-models/{id}/annotations
     * @secure
     */
    aiModelControllerUpdateAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/ai-models/${id}/annotations`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags ai-models
     * @name AiModelControllerDeleteAnnotations
     * @request DELETE:/nest/api/ai-models/{id}/annotations
     * @secure
     */
    aiModelControllerDeleteAnnotations: (
      id: string,
      data: string[],
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nest/api/ai-models/${id}/annotations`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags annotations
     * @name AnnotationControllerCreate
     * @request POST:/nest/api/annotations
     * @secure
     */
    annotationControllerCreate: (
      data: AnnotationCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<Annotation, ForbiddenException>({
        path: `/nest/api/annotations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags annotations
     * @name AnnotationControllerFindMany
     * @request GET:/nest/api/annotations
     * @secure
     */
    annotationControllerFindMany: (
      query?: {
        where?: AnnotationWhereInput;
        orderBy?: AnnotationOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListAnnotationDto, void>({
        path: `/nest/api/annotations`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags annotations
     * @name AnnotationControllerFindDataForExcel
     * @request GET:/nest/api/annotations/fileExcel
     * @secure
     */
    annotationControllerFindDataForExcel: (params: RequestParams = {}) =>
      this.request<FileDto, ForbiddenException>({
        path: `/nest/api/annotations/fileExcel`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags annotations
     * @name AnnotationControllerFindOne
     * @request GET:/nest/api/annotations/{id}
     * @secure
     */
    annotationControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Annotation, ForbiddenException | NotFoundException>({
        path: `/nest/api/annotations/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags annotations
     * @name AnnotationControllerUpdate
     * @request PATCH:/nest/api/annotations/{id}
     * @secure
     */
    annotationControllerUpdate: (
      id: string,
      data: AnnotationUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<Annotation, ForbiddenException | NotFoundException>({
        path: `/nest/api/annotations/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags annotations
     * @name AnnotationControllerDelete
     * @request DELETE:/nest/api/annotations/{id}
     * @secure
     */
    annotationControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<Annotation, ForbiddenException | NotFoundException>({
        path: `/nest/api/annotations/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags collaborators
     * @name CollaboratorControllerCreate
     * @request POST:/nest/api/collaborators
     * @secure
     */
    collaboratorControllerCreate: (
      data: CollaboratorCreateInput,
      params: RequestParams = {},
    ) =>
      this.request<Collaborator, ForbiddenException>({
        path: `/nest/api/collaborators`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags collaborators
     * @name CollaboratorControllerFindMany
     * @request GET:/nest/api/collaborators
     * @secure
     */
    collaboratorControllerFindMany: (
      query?: {
        where?: CollaboratorWhereInput;
        orderBy?: CollaboratorOrderByInput;
        skip?: number;
        take?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetListCollaboratorDto, void>({
        path: `/nest/api/collaborators`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags collaborators
     * @name CollaboratorControllerFindDataForExcel
     * @request GET:/nest/api/collaborators/fileExcel
     * @secure
     */
    collaboratorControllerFindDataForExcel: (params: RequestParams = {}) =>
      this.request<FileDto, ForbiddenException>({
        path: `/nest/api/collaborators/fileExcel`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags collaborators
     * @name CollaboratorControllerFindOne
     * @request GET:/nest/api/collaborators/{id}
     * @secure
     */
    collaboratorControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Collaborator, ForbiddenException | NotFoundException>({
        path: `/nest/api/collaborators/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags collaborators
     * @name CollaboratorControllerUpdate
     * @request PATCH:/nest/api/collaborators/{id}
     * @secure
     */
    collaboratorControllerUpdate: (
      id: string,
      data: CollaboratorUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<Collaborator, ForbiddenException | NotFoundException>({
        path: `/nest/api/collaborators/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags collaborators
     * @name CollaboratorControllerDelete
     * @request DELETE:/nest/api/collaborators/{id}
     * @secure
     */
    collaboratorControllerDelete: (id: string, params: RequestParams = {}) =>
      this.request<Collaborator, ForbiddenException | NotFoundException>({
        path: `/nest/api/collaborators/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name HealthControllerHealthLive
     * @request GET:/nest/api/_health/live
     */
    healthControllerHealthLive: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/nest/api/_health/live`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @name HealthControllerHealthReady
     * @request GET:/nest/api/_health/ready
     */
    healthControllerHealthReady: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/nest/api/_health/ready`,
        method: "GET",
        ...params,
      }),
  };
}
