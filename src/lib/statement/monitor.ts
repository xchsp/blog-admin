import {databaseMap, DatabaseMap} from "../../conf";
import {query} from '../utils';
import {OkPacket} from "mysql";
import {WebPerformanceRequestParams, WebPerformanceResourceParams, WebPageErrorRequestParams} from "../../types/monitor";

const {PERFORMANCE, PERFORMANCE_INTERVAL, EQUIPMENT, PERFORMANCE_RESOURCE, PAGE_ERROR, PAGE_ERROR_RESOURCE} = (databaseMap as DatabaseMap);

export default class Monitor {
    static async createWebPerformance(equipmentId: number, intervalId: number,{fpt, tti, ready, loadTime, firstbyte, compressionRatio, type}: WebPerformanceRequestParams) {
        const sqlStatement = `insert into ${PERFORMANCE} (equipmentId, intervalId, fpt, tti, ready, loadTime, firstbyte, compressionRatio, type) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        return query<OkPacket>(sqlStatement, [equipmentId, intervalId, fpt, tti, ready, loadTime, firstbyte, compressionRatio, type])
    }

    static async createWebPerformanceInterval({dns, tcp, ttfb, trans, dom, res, sslTime}: WebPerformanceRequestParams) {
        const sqlStatement = `insert into ${PERFORMANCE_INTERVAL} (dns, tcp, ttfb, trans, dom, res, sslTime) values (?, ?, ?, ?, ?, ?, ?)`;
        return query<OkPacket>(sqlStatement, [dns, tcp, ttfb, trans, dom, res, sslTime])
    }

    static async createWebPerformanceEquipment({url, userAgent, ip}: {url: string; userAgent: string; ip: string;}) {
        const sqlStatement = `insert into ${EQUIPMENT} (url, userAgent, ip) values (?, ?, ?)`;
        return query<OkPacket>(sqlStatement, [url, userAgent, ip])
    }

    static async createWebPerformanceResource(equipmentId: number, resourceList: WebPerformanceResourceParams[]) {
        const sqlStatement = `insert into ${PERFORMANCE_RESOURCE} (equipmentId, name, encodedBodySize, decodedBodySize, timeout, duration, protocol, type) values ?`;
        const values = resourceList.map(({name, encodedBodySize, decodedBodySize, timeout, duration, protocol, type}) => [equipmentId, name, encodedBodySize, decodedBodySize, timeout, duration, protocol, type]);
        return query<OkPacket>(sqlStatement, [values]);
    }

    static async createWebPageError(userId: number, equipmentId: number, {href, message, url, lineNum, columnNum, error}: WebPageErrorRequestParams) {
        const sqlStatement = `insert into ${PAGE_ERROR} (userId, equipmentId, href, message, url, lineNum, columnNum, error) values (?, ?, ?, ?, ?, ?, ?, ?)`;
        return query<OkPacket>(sqlStatement, [userId, equipmentId, href, message, url, lineNum, columnNum, error])
    }

    static async createWebPageResourceError(userId: number, equipmentId: number, {href, src}: {href: string, src: string}) {
        const sqlStatement = `insert into ${PAGE_ERROR_RESOURCE} (userId, equipmentId, href, src) values (?, ?, ?, ?)`;
        return query<OkPacket>(sqlStatement, [userId, equipmentId, href, src]);
    }
}