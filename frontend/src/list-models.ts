import "dotenv/config";

async function main() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
    const data = await res.json();
    console.log(data.models.map((m: any) => m.name).join("\n"));
  } catch (err) {
    console.error(err);
  }
}

main();
