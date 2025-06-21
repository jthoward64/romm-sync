import {
  AuthApi,
  CollectionsApi,
  ConfigApi,
  type Configuration,
  createConfiguration,
  FeedsApi,
  FirmwareApi,
  type HttpMethod,
  PlatformsApi,
  RawApi,
  type RequestBody,
  RequestContext,
  type ResponseContext,
  RomsApi,
  SavesApi,
  ScreenshotsApi,
  SearchApi,
  type SimpleRomSchema,
  StatesApi,
  StatsApi,
  SystemApi,
  TasksApi,
  UsersApi,
} from "@tajetaje/romm-api";
import type { authSchema } from "../database/schema.ts";

export class RommApiClient {
  readonly authApi: AuthApi;
  readonly rawApi: RawApi;
  readonly romsApi: RomsApi;
  readonly feedsApi: FeedsApi;
  readonly savesApi: SavesApi;
  readonly statsApi: StatsApi;
  readonly tasksApi: TasksApi;
  readonly usersApi: UsersApi;
  readonly configApi: ConfigApi;
  readonly searchApi: SearchApi;
  readonly statesApi: StatesApi;
  readonly systemApi: SystemApi;
  readonly firmwareApi: FirmwareApi;
  readonly platformsApi: PlatformsApi;
  readonly collectionsApi: CollectionsApi;
  readonly screenshotsApi: ScreenshotsApi;

  private readonly configuration: Configuration;

  constructor(auth: Omit<typeof authSchema.$inferSelect, "id">) {
    this.configuration = createConfiguration({
      authMethods: {
        HTTPBasic: {
          username: auth.username,
          password: auth.password,
        },
      },
      baseServer: {
        makeRequestContext(endpoint, httpMethod) {
          return new RequestContext(`${auth.origin}${endpoint}`, httpMethod);
        },
      },
    });

    this.authApi = new AuthApi(this.configuration);
    this.rawApi = new RawApi(this.configuration);
    this.romsApi = new RomsApi(this.configuration);
    this.feedsApi = new FeedsApi(this.configuration);
    this.savesApi = new SavesApi(this.configuration);
    this.statsApi = new StatsApi(this.configuration);
    this.tasksApi = new TasksApi(this.configuration);
    this.usersApi = new UsersApi(this.configuration);
    this.configApi = new ConfigApi(this.configuration);
    this.searchApi = new SearchApi(this.configuration);
    this.statesApi = new StatesApi(this.configuration);
    this.systemApi = new SystemApi(this.configuration);
    this.firmwareApi = new FirmwareApi(this.configuration);
    this.platformsApi = new PlatformsApi(this.configuration);
    this.collectionsApi = new CollectionsApi(this.configuration);
    this.screenshotsApi = new ScreenshotsApi(this.configuration);
  }

  static #instance: RommApiClient | null = null;
  public static get instance(): RommApiClient {
    if (!RommApiClient.#instance) {
      throw new Error("RommApiClient is not initialized. Call init first.");
    }
    return RommApiClient.#instance;
  }

  public static get isInitialized(): boolean {
    return RommApiClient.#instance !== null;
  }

  public static init(
    auth: Omit<typeof authSchema.$inferSelect, "id">,
  ): RommApiClient {
    RommApiClient.#instance = new RommApiClient(auth);
    return RommApiClient.#instance;
  }

  async loadAllRoms() {
    let remaining = Number.MAX_SAFE_INTEGER;
    let offset = 0;
    const allRoms: SimpleRomSchema[] = [];
    while (remaining > 0) {
      const response = await this.romsApi.getRomsApiRomsGet({
        limit: 100,
        offset: offset,
      });
      allRoms.push(...response.items);
      remaining = (response.total ?? 0) - (response.offset ?? 0);
      offset += response.items.length;
    }
    return allRoms;
  }

  async makeRequest(
    method: HttpMethod,
    path: string | URL,
    body?: { payload: RequestBody; mediaType?: string },
  ): Promise<ResponseContext> {
    const requestContext = this.configuration.baseServer.makeRequestContext(
      typeof path === "string" ? path : path.pathname,
      method,
    );

    this.configuration.authMethods.HTTPBasic?.applySecurityAuthentication(
      requestContext,
    );

    if (body) {
      requestContext.setBody(body.payload);
      if (body.mediaType) {
        requestContext.setHeaderParam("Content-Type", body.mediaType);
      }
    }

    const response = await this.configuration.httpApi
      .send(requestContext)
      .toPromise();
    if (response.httpStatusCode < 200 || response.httpStatusCode >= 300) {
      throw new Error(
        `Request failed with status code ${response.httpStatusCode}: ${await response.body.text()}`,
      );
    }
    return response;
  }
}
