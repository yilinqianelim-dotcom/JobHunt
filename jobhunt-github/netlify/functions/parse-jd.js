// JD 智能识别云函数
// 环境变量（在 Netlify 后台 Environment variables 配置）：
//   LLM_API_KEY  必填，大模型平台的 API 密钥
//   LLM_API_URL  选填，默认 DeepSeek；换智谱填 https://open.bigmodel.cn/api/paas/v4/chat/completions
//   LLM_MODEL    选填，默认 deepseek-chat；换智谱填 glm-4-flash
exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  try {
    const { text } = JSON.parse(event.body || "{}");
    if (!text || typeof text !== "string")
      return { statusCode: 400, headers, body: JSON.stringify({ error: "缺少文本" }) };
    if (text.length > 6000)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "文本过长" }) };

    const key = process.env.LLM_API_KEY;
    if (!key)
      return { statusCode: 500, headers, body: JSON.stringify({ error: "服务端未配置 LLM_API_KEY" }) };
    const url = process.env.LLM_API_URL || "https://api.deepseek.com/chat/completions";
    const model = process.env.LLM_MODEL || "deepseek-chat";

    const sys =
      "你是求职信息抽取器。第一步：判断用户文本是否是招聘职位信息(JD)，注意文本可能含OCR错字。" +
      "如果明显不是JD（如闲聊、简历、新闻、乱码、与求职无关的内容），只输出：" +
      '{"valid":false,"reason":"一句话说明不符合原因及需要补充什么，例如：这段内容看起来不是职位描述，请提供包含公司名、岗位名、薪资或任职要求的招聘信息"}。' +
      "如果是JD，输出一个JSON对象（不要任何其他文字或markdown）：" +
      '{"valid":true,"company":"公司名，无则空串","position":"岗位名",' +
      '"category":"职业类型，从[研发,产品,设计,数据分析,运营,市场销售,金融,咨询,管培生,职能]选最合适的一个，都不合适则自拟2-4字",' +
      '"salary":"薪资原文如18-25K·15薪，无则空串","requirement":"任职要求要点，60字内，用·分隔","city":"工作城市，无则空串"}。' +
      "OCR错字按常识纠正。信息不全但确实是JD时，valid仍为true，缺的字段留空串。";

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 300,
      }),
    });
    if (!resp.ok)
      return { statusCode: 502, headers, body: JSON.stringify({ error: "上游接口错误 " + resp.status }) };
    const data = await resp.json();
    let out = (data.choices && data.choices[0] && data.choices[0].message.content) || "";
    out = out.replace(/```json|```/g, "").trim();
    const m = out.match(/\{[\s\S]*\}/);
    if (!m) return { statusCode: 500, headers, body: JSON.stringify({ error: "模型输出异常" }) };
    const j = JSON.parse(m[0]);
    return { statusCode: 200, headers, body: JSON.stringify(j) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "解析失败" }) };
  }
};
