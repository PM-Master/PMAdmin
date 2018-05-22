import { PmNode } from './pmnode';

export class AccessEntry {
    constructor(
        public target: PmNode,
        public operations: string[]
    ) { }
}
