
import { projectList } from '../Project/Project-ts';
import { PrismaClient } from "@prisma/client";
import * as fs from 'fs'
const prisma = new PrismaClient();

export let imageList = (JSON.parse(fs.readFileSync('/app/prisma/seed-generated-output/data/Image/Image.json', 'utf-8')))["Image"]

export const addImageSeedData = async() => {
    try {
        let usedProjectIds: any[] = []
        
        imageList = imageList.map((fields: any) => {
            let relationFieldsToAdd: any = {}
            
            let projectId = undefined
            if (usedProjectIds.length < projectList.length) {
                while (usedProjectIds.includes(projectId) || projectId === undefined) {
                    projectId = projectList[Math.floor(Math.random() * (projectList.length))].id
                }
                relationFieldsToAdd["projectId"] = projectId 
                usedProjectIds.push(projectId)
            }
        
            return Object.keys(relationFieldsToAdd).length == 0 ?  fields : {...fields, ...relationFieldsToAdd}
        })

        
        for (let i = 0; i < imageList.length; i++) {
            await prisma.image.upsert({
                where: {
                    id: imageList[i].id,
                },
                update: imageList[i],
                create: imageList[i],
            })

        }
    } catch (error: any) {
        console.log("Error pushing to: Image")
        console.log("Error:", error)
    }

}