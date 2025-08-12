import { Source } from "react-map-gl";

export function MapboxSource(props: any) {
  // Log all props received
  if (props.id) {
    console.log(
      "[MapboxSource] received props for",
      props.id,
      Object.keys(props)
    );
  }

  // Only include props that are actually defined
  const {
    id,
    type,
    data,
    url,
    tiles,
    tileSize,
    minzoom,
    maxzoom,
    attribution,
    buffer,
    tolerance,
    cluster,
    clusterRadius,
    clusterMaxZoom,
    clusterProperties,
    lineMetrics,
    generateId,
    promoteId,
    filter,
    children,
  } = props;

  const sourceProps: any = { id, type, data };
  if (url !== undefined) sourceProps.url = url;
  if (tiles !== undefined) sourceProps.tiles = tiles;
  if (tileSize !== undefined) sourceProps.tileSize = tileSize;
  if (minzoom !== undefined) sourceProps.minzoom = minzoom;
  if (maxzoom !== undefined) sourceProps.maxzoom = maxzoom;
  if (attribution !== undefined) sourceProps.attribution = attribution;
  if (buffer !== undefined) sourceProps.buffer = buffer;
  if (tolerance !== undefined) sourceProps.tolerance = tolerance;
  if (cluster !== undefined) sourceProps.cluster = cluster;
  if (clusterRadius !== undefined) sourceProps.clusterRadius = clusterRadius;
  if (clusterMaxZoom !== undefined) sourceProps.clusterMaxZoom = clusterMaxZoom;
  if (clusterProperties !== undefined)
    sourceProps.clusterProperties = clusterProperties;
  if (lineMetrics !== undefined) sourceProps.lineMetrics = lineMetrics;
  if (generateId !== undefined) sourceProps.generateId = generateId;
  if (promoteId !== undefined) sourceProps.promoteId = promoteId;
  if (filter !== undefined) sourceProps.filter = filter;

  // Log all props passed to <Source>
  if (id) {
    console.log(
      "[MapboxSource] passing to <Source> for",
      id,
      Object.keys(sourceProps)
    );
    // Check for unexpected props
    const allowed = [
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
      "filter",
    ];
    const extra = Object.keys(props).filter(
      (k) => !allowed.includes(k) && k !== "children"
    );
    if (extra.length > 0) {
      console.warn(
        "[MapboxSource] Unexpected props for",
        id,
        extra,
        new Error().stack
      );
    }
  }

  return <Source {...sourceProps}>{children}</Source>;
}
