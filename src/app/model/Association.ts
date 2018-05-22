import { PmNode } from './pmnode';

export class Association {
  constructor(
    public parent: PmNode,
    public child: PmNode,
    public ops: string[]
  ) { }
}
