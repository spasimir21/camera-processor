function imageCenter(width: number, height: number, parent_width: number, parent_height: number): number[] {
  return [-((width - parent_width) / 2), -((height - parent_height) / 2)];
}

function imageCover(width: number, height: number, parent_width: number, parent_height: number): number[] {
  const parent_ratio = parent_width / parent_height;
  const child_ratio = width / height;

  return [
    child_ratio < parent_ratio ? parent_width : parent_height * child_ratio,
    child_ratio < parent_ratio ? parent_width / child_ratio : parent_height
  ];
}

export { imageCenter, imageCover };
