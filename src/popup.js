import OpenAI from 'openai';

// 初始化 OpenAI 客户端（用于 Kimi API）
const openai = new OpenAI({
  apiKey: 'sk-KO3Ji7c9i80thxa7XhWCe4VfQfUnkXzqqgKKnYFhM0tjPqm2',
  baseURL: 'https://api.moonshot.cn/v1', // Kimi API 端点
  dangerouslyAllowBrowser: true
});

// 文件上传函数
async function uploadFile(file) {
  try {
    const fileResponse = await openai.files.create({
      file: file,
      purpose: 'file-extract'
    });
    
    return fileResponse.id;
  } catch (error) {
    throw new Error(`上传失败: ${error.message}`);
  }
}

// 图片分析函数
async function analyzeImage(fileId) {
  let file_content = await (await openai.files.content(fileId)).text()  
  try {
    const completion = await openai.chat.completions.create({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'user',
          content: file_content,
        },
        {
          "role": "user", 
          "content": "识别图中的内容，并满足以下要求：1，正确识别图中的文字和数学公式。2，所有数学公式应用单个$进行包裹。3，只输出识别的内容，不输出其他任何内容。"
        }

      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`分析失败: ${error.message}`);
  }
}

// 保存为Markdown文件
function saveAsMarkdown(content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  chrome.downloads.download({
    url: url,
    filename: `image-analysis-${timestamp}.md`,
    saveAs: true
  });
}

// 预览图片
function previewImage(file) {
  const preview = document.getElementById('preview');
  const reader = new FileReader();
  
  reader.onload = function(e) {
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  
  reader.readAsDataURL(file);
}

// 主程序
document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('imageInput');
  const processButton = document.getElementById('processButton');
  const status = document.getElementById('status');

  imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      previewImage(e.target.files[0]);
    }
  });

  processButton.addEventListener('click', async () => {
    if (!imageInput.files.length) {
      status.textContent = '请先选择图片';
      return;
    }

    const file = imageInput.files[0];
    status.textContent = '正在上传图片...';

    try {
      // 上传文件
      const fileId = await uploadFile(file);
      status.textContent = '正在分析图片...';

      // 分析图片
      const markdownContent = await analyzeImage(fileId);
      status.textContent = '正在生成Markdown文件...';

      // 保存文件
      saveAsMarkdown(markdownContent);
      status.textContent = '处理完成！正在下载Markdown文件...';
    } catch (error) {
      status.textContent = error.message;
      console.error('Error:', error);
    }
  });
}); 