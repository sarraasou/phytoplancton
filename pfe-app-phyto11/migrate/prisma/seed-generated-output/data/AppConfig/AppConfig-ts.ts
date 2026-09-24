import { PrismaClient } from "@prisma/client";
import fs from 'fs'
const prisma = new PrismaClient();

import path from 'path';

// On utilise path.join(__dirname, 'AppConfig.json') pour qu'il cherche le fichier juste à côté de lui
export let appConfigList = (JSON.parse(fs.readFileSync(path.join(__dirname, 'AppConfig.json'), 'utf-8')))["AppConfig"]

export const addAppConfigSeedData = async() => {
    try {
        for (let i = 0; i < appConfigList.length; i++) {
            await prisma.appConfig.upsert({
                where: {
                    id: appConfigList[i].id,
                },
                update: appConfigList[i],
                create: appConfigList[i],
            })
        }
        console.log("AppConfig seeded !");
    } catch (error: any) {
        console.log("Error pushing to: AppConfig")
        console.log("Error:", error)
    }
}