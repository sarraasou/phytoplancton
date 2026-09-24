
import { userList } from '../User/User-ts';
import { PrismaClient } from "@prisma/client";
import * as fs from 'fs'
const prisma = new PrismaClient();

export let projectList = (JSON.parse(fs.readFileSync('/app/prisma/seed-generated-output/data/Project/Project.json', 'utf-8')))["Project"]

export const addProjectSeedData = async() => {
    try {
        let usedUserIds: any[] = []
        
        projectList = projectList.map((fields: any) => {
            let relationFieldsToAdd: any = {}
            
            let userId = undefined
            if (usedUserIds.length < userList.length) {
                while (usedUserIds.includes(userId) || userId === undefined) {
                    userId = userList[Math.floor(Math.random() * (userList.length))].id
                }
                relationFieldsToAdd["userId"] = userId 
                usedUserIds.push(userId)
            }
        
            return Object.keys(relationFieldsToAdd).length == 0 ?  fields : {...fields, ...relationFieldsToAdd}
        })

        
        for (let i = 0; i < projectList.length; i++) {
            await prisma.project.upsert({
                where: {
                    id: projectList[i].id,
                },
                update: projectList[i],
                create: projectList[i],
            })

        }
    } catch (error: any) {
        console.log("Error pushing to: Project")
        console.log("Error:", error)
    }

}