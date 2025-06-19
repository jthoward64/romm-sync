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
  StatesApi,
  StatsApi,
  SystemApi,
  TasksApi,
  UsersApi,
} from "@tajetaje/romm-api";
import type { DbAuth } from "../database/Auth";

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

  constructor(auth: DbAuth) {
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
}
