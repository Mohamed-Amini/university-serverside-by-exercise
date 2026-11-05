import { DAO } from './DAO.ts';
import { TestSrvs } from './TestSrvs.ts';

const srvs = new TestSrvs();

console.log(await srvs.getName(1));
console.log(await srvs.getNames(1, 5));
console.log(await srvs.addStation({
    districtId: 1,
    name: `Новая станция ${Date.now()}`,
    address: 'ул. Ленина, 1',
    capacity: 10,
    latitude: '55.750000',
    longitude: '37.600000',
    openedOn: '2026-11-05',
}));

await DAO.close();
