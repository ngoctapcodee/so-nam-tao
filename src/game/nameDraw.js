// Đường chạy đi qua danh sách nhiều vòng, giảm tốc và dừng đúng kết quả
// đã được bốc bằng crypto; hoạt cảnh không thay đổi xác suất chọn.
export function createNameDraw(names, selectedName, random = Math.random) {
  const count = names.length;
  if (!count) return { count: 0, start: 0, distance: 0 };
  const start = Math.floor(random() * count);
  const target = Math.max(0, names.indexOf(selectedName));
  const laps = Math.max(3, Math.ceil(48 / count));
  return { count, start, distance: laps * count + (target - start + count) % count };
}
export function nameDrawCursor(draw, progress) {
  if (!draw.count) return { index: 0, step: 0, fraction: 0 };
  const q = Math.max(0, Math.min(1, progress));
  const travel = q === 1 ? draw.distance : draw.distance * (1 - Math.pow(1 - q, 2.5));
  const step = Math.floor(travel), fraction = travel - step;
  return { index: (draw.start + step) % draw.count, step, fraction };
}
