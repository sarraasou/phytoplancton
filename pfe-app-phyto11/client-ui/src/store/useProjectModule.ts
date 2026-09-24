import { ProjectUpdateInput, ProjectCreateInput, Project } from "./../../index";
import { defineStore } from "pinia";
import service from "@/service";
import { storeToRefs } from "pinia";
import { useBodyStore } from "@/store/useBodyModule";
import _ from "lodash";

interface IPagination {
  take?: number;
  skip?: number;
}
const { isLoading } = storeToRefs(useBodyStore());
const initialState: Project | ProjectCreateInput | ProjectUpdateInput = {
  title: "",
  tool: "",
  user: { id: "0a6ef296-6b69-41e0-bad1-290e937f6b64" },
};
export const useProjectStore = defineStore("project-store", {
  state: () => {
    return {
      projectList: [] as Array<Project>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      project: _.cloneDeep(initialState) as
        | Project
        | ProjectCreateInput
        | ProjectUpdateInput,
      projectExcelFile: "" as string,
      projectPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchProjects(payload?: IPagination) {
      try {
        const { data } = await service.nest.projectControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
          "orderBy[createdAt]":"desc"
        });
        this.projectList = data.paginatedResult;

        this.projectList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.projectPagination = {
          total: data.totalCount,
          skip: payload?.skip ?? 0,
          take: payload?.take ?? data.totalCount,
        };
        localStorage.setItem(
          "take",
          payload?.take?.toString() ?? data.totalCount.toString()
        );
        this.error = null;
      } catch (err: any) {
        this.projectList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelProjects() {
      try {
        const { data } = await service.nest.projectControllerFindDataForExcel();
        this.projectExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteProject(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.projectControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchProjects({
          take: this.projectPagination.take,
          skip: this.projectPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteProject(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.projectControllerDelete(payload);
        this.projectList = this.projectList.filter(
          (project) => project.id !== data.id
        );
        this.projectPagination.total--;
        this.isLoading = false;
        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async editProject(payload: { id: string; data?: ProjectUpdateInput }) {
      this.isLoading = true;
      try {
        const editProjectData: ProjectUpdateInput =
          payload.data ?? this.project;
        editProjectData.user =
          editProjectData.user && editProjectData.user.id?.length > 0
            ? editProjectData.user
            : undefined;
        const { data } = await service.nest.projectControllerUpdate(
          payload.id,
          editProjectData
        );
        this.projectList = this.projectList.map((item) =>
          item.id === payload.id ? { ...item, ...data } : item
        );
        this.error = null;
      } catch (err: any) {
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    } /*
      async editManyProject(payload: { data: ProjectUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.nest.projectControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.projectList = this.projectList.map((item) =>
            item.id === payload.id ? { ...item, ...payload.data } : item
          );
          this.error = null;
        } catch (err:any) {
          console.error("Error Update  ITEMS", err.error);
          this.error = err.error;
        } finally {
          this.isLoading = false;
        }
      },*/,

    async getProjectById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.projectControllerFindOne(payload);
        this.project = {
          ...data,
          user: data.user ? data.user : { id: "" },
        };
        this.error = null;
        return data
      } catch (err: any) {
        this.resetProject();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createProject(payload?: { data: ProjectCreateInput }) {
      this.isLoading = true;
      try {
        const rawProjectData: any =
          payload?.data ?? (this.project as ProjectCreateInput);
        const {
          id: _ignoredId,
          createdAt: _ignoredCreatedAt,
          updatedAt: _ignoredUpdatedAt,
          deletedAt: _ignoredDeletedAt,
          ...createProjectData
        } = rawProjectData;
        createProjectData.user =
          createProjectData.user && createProjectData.user.id?.length > 0
            ? createProjectData.user
            : undefined;
        const { data } = await service.nest.projectControllerCreate(
          createProjectData
        );
        this.projectList = [...this.projectList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyProject(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.projectControllerCreateMany(payload);
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetProject() {
      this.$reset();
    },
    disposeProject() {
      this.$dispose();
    },
  },
});
