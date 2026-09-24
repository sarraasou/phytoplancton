
import { PrismaClient } from "@prisma/client";
import fs from 'fs'
const prisma = new PrismaClient();

export let aiModelList = (JSON.parse(fs.readFileSync('/app/prisma/seed-generated-output/data/AiModel/AiModel.json', 'utf-8')))["AiModel"]

export const addAiModelSeedData = async() => {
    try {
        for (let i = 0; i < aiModelList.length; i++) {
            await prisma.aiModel.upsert({
                where: {
                    id: aiModelList[i].id,
                },
                update: aiModelList[i],
                create: aiModelList[i],
            })

        }
    } catch (error: any) {
        console.log("Error pushing to: AiModel")
        console.log("Error:", error)
    }

}