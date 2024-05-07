import { defHttp } from '@/utils/http';

enum Api {
	AREA_RECORD = 'www.baidu.com',
}
type TestParams = {
	name: string;
};

type TestModel = null;

export const testApi = (data: TestParams) => defHttp.post<TestModel>({ url: Api.AREA_RECORD, data });
