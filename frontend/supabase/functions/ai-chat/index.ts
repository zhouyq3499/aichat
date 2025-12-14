import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const brainTeasers = [
  {
    question: "什么东西越洗越脏？",
    answer: "水"
  },
  {
    question: "什么门永远关不上？",
    answer: "球门"
  },
  {
    question: "什么车没有轮子？",
    answer: "风车"
  },
  {
    question: "什么东西有头无脚？",
    answer: "砖头"
  },
  {
    question: "什么动物的屁股杀伤力比嘴厉害？",
    answer: "黄蜂（马蜂）"
  },
  {
    question: "什么书中毛病最多？",
    answer: "医书"
  },
  {
    question: "什么东西人们都不喜欢吃？",
    answer: "吃亏"
  },
  {
    question: "大象的左耳朵像什么？",
    answer: "右耳朵"
  }
];

interface ChatRequest {
  message: string;
  conversationId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, conversationId }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "消息内容不能为空" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const lowerMessage = message.toLowerCase().trim();
    let aiResponse = "";

    if (lowerMessage.includes("脑筋急转弯") || lowerMessage.includes("题") || lowerMessage.includes("故事") || lowerMessage.includes("问题")) {
      const randomTeaser = brainTeasers[Math.floor(Math.random() * brainTeasers.length)];
      aiResponse = `好的！让我给你出一个脑筋急转弯：\n\n${randomTeaser.question}\n\n你知道答案吗？`;
    } else if (lowerMessage.includes("不知道") || lowerMessage.includes("答案") || lowerMessage.includes("是什么")) {
      const randomTeaser = brainTeasers[Math.floor(Math.random() * brainTeasers.length)];
      aiResponse = `这个问题的答案是：${randomTeaser.answer}！\n\n要不要再来一题？`;
    } else if (lowerMessage.includes("再来") || lowerMessage.includes("继续") || lowerMessage.includes("下一")) {
      const randomTeaser = brainTeasers[Math.floor(Math.random() * brainTeasers.length)];
      aiResponse = `好的！下一题：\n\n${randomTeaser.question}\n\n猜猜看！`;
    } else {
      aiResponse = "嗯，这个答案很有创意！要不要我再给你出一道脑筋急转弯题目？";
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "处理请求时出错" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
