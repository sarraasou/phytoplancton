
import { aiModelList } from '../AiModel/AiModel-ts';
import { imageList } from '../Image/Image-ts';
import { userList } from '../User/User-ts';
import { PrismaClient } from "@prisma/client";
import * as fs from 'fs'
const prisma = new PrismaClient();

export let annotationList = (JSON.parse(fs.readFileSync('/app/prisma/seed-generated-output/data/Annotation/Annotation.json', 'utf-8')))["Annotation"]

export const addAnnotationSeedData = async() => {
    try {
        let usedAimodelIds: any[] = []
	let usedImageIds: any[] = []
	let usedValidatedByIds: any[] = []
        
        annotationList = annotationList.map((fields: any) => {
            let relationFieldsToAdd: any = {}
            
            let aimodelId = undefined
            if (usedAimodelIds.length < aiModelList.length) {
                while (usedAimodelIds.includes(aimodelId) || aimodelId === undefined) {
                    aimodelId = aiModelList[Math.floor(Math.random() * (aiModelList.length))].id
                }
                relationFieldsToAdd["aimodelId"] = aimodelId 
                usedAimodelIds.push(aimodelId)
            }

            let imageId = undefined
            if (usedImageIds.length < imageList.length) {
                while (usedImageIds.includes(imageId) || imageId === undefined) {
                    imageId = imageList[Math.floor(Math.random() * (imageList.length))].id
                }
                relationFieldsToAdd["imageId"] = imageId 
                usedImageIds.push(imageId)
            }

            let validatedById = undefined
            if (usedValidatedByIds.length < userList.length) {
                while (usedValidatedByIds.includes(validatedById) || validatedById === undefined) {
                    validatedById = userList[Math.floor(Math.random() * (userList.length))].id
                }
                relationFieldsToAdd["validatedById"] = validatedById 
                usedValidatedByIds.push(validatedById)
            }
        
            return Object.keys(relationFieldsToAdd).length == 0 ?  fields : {...fields, ...relationFieldsToAdd}
        })

        
        for (let i = 0; i < annotationList.length; i++) {
            await prisma.annotation.upsert({
                where: {
                    id: annotationList[i].id,
                },
                update: annotationList[i],
                create: annotationList[i],
            })

        }
    } catch (error: any) {
        console.log("Error pushing to: Annotation")
        console.log("Error:", error)
    }

}