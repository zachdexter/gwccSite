import { PageIconFill } from "@/components/PageIconFill";
import { HeaderIconCluster } from "@/components/HeaderIconCluster";
import { SIDE_ICON_POOL } from "@/lib/decorIconPool";
import { computeClusterBounds, type DecorIcon } from "@/lib/decorBounds";

// Fixed pixel offsets from the title block's top-left corner. Paste output from
// /dev/scatter-faq here.
const headerIcons: DecorIcon[] = [];

const clusterBounds = computeClusterBounds(headerIcons);

export function FaqHeaderIcons() {
  return <HeaderIconCluster icons={headerIcons} />;
}

// Fills whatever blank page space is left, procedurally, at every viewport width.
export function FaqDecorFill() {
  return <PageIconFill pool={SIDE_ICON_POOL} clusterBounds={clusterBounds} />;
}
