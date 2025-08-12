import { Source } from "react-map-gl";

export function MapboxSource(props: any) {
  const { children, ...rest } = props;
  const allowed = new Set([
    "id",
    "type",
    "data",
    "url",
    "tiles",
    "tileSize",
    "minzoom",
    "maxzoom",
    "attribution",
    "buffer",
    "tolerance",
    "cluster",
    "clusterRadius",
    "clusterMaxZoom",
    "clusterProperties",
    "lineMetrics",
    "generateId",
    "promoteId",
  ]);
  const sourceProps: any = {};
  Object.keys(rest).forEach((key) => {
    if (allowed.has(key)) {
      sourceProps[key] = (rest as any)[key];
    }
  });
  return <Source {...sourceProps}>{children}</Source>;
}
