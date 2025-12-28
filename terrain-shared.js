// Shared terrain mixins to consolidate tile renderers and biome helpers
export function applyTerrainMixins(proto, profile = 'pc') {
  // Tombstone: drawEnhancedTerrainTile, drawTerrainDetails, and multiple biome-specific tile renderers are centralized here.
  proto.drawTileShared = function(ctx, type, x, y, size, detailNoise = 0, moisture = 0) {
    switch (type) {
      case 'grass': return this.drawEnhancedGrassTile?.(ctx, x, y, size, detailNoise, moisture);
      case 'snow': return this.drawEnhancedSnowTile?.(ctx, x, y, size, detailNoise);
      case 'shallow_water': case 'water': return this.drawEnhancedWaterTile?.(ctx, x, y, size, '#1976d2', '#2196f3', '#64b5f6');
      case 'deep_fjord_water': return this.drawEnhancedWaterTile?.(ctx, x, y, size, '#0d47a1', '#1565c0', '#1976d2');
      case 'beach': return this.drawEnhancedBeachTile?.(ctx, x, y, size, moisture);
      default: return this.drawEnhancedGrassTile?.(ctx, x, y, size, detailNoise, moisture);
    }
  };
}