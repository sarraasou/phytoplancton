
import { userList } from '../User/User-ts';
import { projectList } from '../Project/Project-ts';
import { PrismaClient } from "@prisma/client";
import * as fs from 'fs'
const prisma = new PrismaClient();

export let collaboratorList = (JSON.parse(fs.readFileSync('/app/prisma/seed-generated-output/data/Collaborator/Collaborator.json', 'utf-8')))["Collaborator"]

export const addCollaboratorSeedData = async() => {
    try {
        let usedUserIds: any[] = []
	let usedProjectIds: any[] = []
        
        collaboratorList = collaboratorList.map((fields: any) => {
            let relationFieldsToAdd: any = {}
            
            let userId = undefined
            if (usedUserIds.length < userList.length) {
                while (usedUserIds.includes(userId) || userId === undefined) {
                    userId = userList[Math.floor(Math.random() * (userList.length))].id
                }
                relationFieldsToAdd["userId"] = userId 
                usedUserIds.push(userId)
            }

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

        
        for (let i = 0; i < collaboratorList.length; i++) {
            await prisma.collaborator.upsert({
                where: {
                    id: collaboratorList[i].id,
                },
                update: collaboratorList[i],
                create: collaboratorList[i],
            })

        }
    } catch (error: any) {
        console.log("Error pushing to: Collaborator")
        console.log("Error:", error)
    }

}