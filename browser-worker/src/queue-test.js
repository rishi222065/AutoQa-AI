
const { Queue, Worker, QueueEvents } = require("bullmq");

const queueName = "autoqa-phase1-smoke";
const connection = {
    host: "127.0.0.1",
    port: 6379,
};

async function main() {
    const queue = new Queue(queueName, { connection });
    const queueEvents = new QueueEvents(queueName, { connection });

    const worker = new Worker(
        queueName,
        async (job) => {
            console.log("Processing job:", job.name);

            return {
                success: true,
                message: job.data.message,
                processedAt: new Date().toISOString(),
            };
        },
        { connection }
    );

    try {
        await queueEvents.waitUntilReady();
        await worker.waitUntilReady();

        const job = await queue.add("phase1-check", {
            message: "AutoQA AI queue is working!",
        });

        const result = await job.waitUntilFinished(queueEvents, 15000);

        console.log("Job ID:", job.id);
        console.log("Job result:", result);
        console.log("BullMQ test completed successfully!");
    } finally {
        await worker.close();
        await queueEvents.close();
        await queue.close();
    }
}

main().catch((error) => {
    console.error("BullMQ test failed:", error);
    process.exitCode = 1;
});
