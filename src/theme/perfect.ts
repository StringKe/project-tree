import {LevInfo} from '../type';
import * as fs from "fs";
import * as path from "path";

const firMid: string = '├';
const las: string = '└';
const vertical: string = '│';
const horizontal: string = '─';

const caches: Record<string, [string, string][]> = {};

function isExists(dir: string) {
    return fs.existsSync(dir);
}

function readTitle(fullPath: string): [string, string][] | void {
    const treePath = path.join(path.dirname(fullPath), '.tree');
    if (isExists(treePath)) {
        return fs.readFileSync(treePath, 'utf-8').toString().replace('\r\n', '\n').split('\n').map(line => {
            const [fileName, title] = line.split('=');
            return [fileName.trim(), title] as [string, string];
        });
    }
}

function getTitle(dir: string) {
    const content = caches[dir] || readTitle(dir);
    if (!content) {
        return undefined;
    }
    const name = path.basename(dir);
    const [, title] = content.find(item => item[0] === name) || [name, undefined];
    if (title) {
        return title.replace(/^\s*/, "");
    }
    return undefined;
}


export default function (levInfos: LevInfo[]): {
    maxLen: number; lines: any;
} {
    let maxLen: number = 0;

    const lines = levInfos.map((item: LevInfo) => {
        const {pathName, level, lasStatus, ancestor} = item;
        const title = getTitle(path.join(ancestor, pathName));
        let line: string = '';
        line += lasStatus
            .slice(1, lasStatus.length - 1)
            .map((item: number) => {
                return item ? '   ' : `${vertical}  `;
            })
            .join('');
        let lastIcon: string = '';
        if (level > 0) {
            lastIcon = (lasStatus.slice(-1)[0] ? las : firMid) + horizontal + ' ';
        }
        line += lastIcon;
        const lineName = `${line}${pathName}`;
        maxLen = lineName.length > maxLen ? lineName.length : maxLen;
        return [lineName, title];
    });

    return {maxLen, lines};
}
