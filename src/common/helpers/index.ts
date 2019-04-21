export * from './geometry';

// 下载器
export const downLoader = (
  result: any, // 内容
  fileName: string, // 文件名
) => {
  const aDom = document.createElement('a');
  aDom.style.display = 'none';
  document.body.appendChild(aDom);

  aDom.href = URL.createObjectURL(new Blob([result], { type: 'text/plain' }));
  aDom.download = fileName;
  aDom.click();
};
