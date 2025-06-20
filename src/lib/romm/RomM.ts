import {
  AuthApi,
  CollectionsApi,
  ConfigApi,
  createConfiguration,
  FeedsApi,
  FirmwareApi,
  PlatformsApi,
  RawApi,
  RequestContext,
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

  constructor(auth: Omit<typeof authSchema.$inferSelect, "id">) {
    const configuration = createConfiguration({
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

    this.authApi = new AuthApi(configuration);
    this.rawApi = new RawApi(configuration);
    this.romsApi = new RomsApi(configuration);
    this.feedsApi = new FeedsApi(configuration);
    this.savesApi = new SavesApi(configuration);
    this.statsApi = new StatsApi(configuration);
    this.tasksApi = new TasksApi(configuration);
    this.usersApi = new UsersApi(configuration);
    this.configApi = new ConfigApi(configuration);
    this.searchApi = new SearchApi(configuration);
    this.statesApi = new StatesApi(configuration);
    this.systemApi = new SystemApi(configuration);
    this.firmwareApi = new FirmwareApi(configuration);
    this.platformsApi = new PlatformsApi(configuration);
    this.collectionsApi = new CollectionsApi(configuration);
    this.screenshotsApi = new ScreenshotsApi(configuration);
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
}
