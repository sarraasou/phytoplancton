import {
  CollaboratorUpdateInput,
  CollaboratorCreateInput,
  Collaborator,
} from "./../../index";
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
const initialState:
  | Collaborator
  | CollaboratorCreateInput
  | CollaboratorUpdateInput = { user: { id: "" }, project: { id: "" } };
export const useCollaboratorStore = defineStore("collaborator-store", {
  state: () => {
    return {
      collaboratorList: [] as Array<Collaborator>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      collaborator: _.cloneDeep(initialState) as
        | Collaborator
        | CollaboratorCreateInput
        | CollaboratorUpdateInput,
      collaboratorExcelFile: "" as string,
      collaboratorPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchCollaborators(payload?: IPagination) {
      try {
        const { data } = await service.nest.collaboratorControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.collaboratorList = data.paginatedResult;

        this.collaboratorList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.collaboratorPagination = {
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
        this.collaboratorList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelCollaborators() {
      try {
        const {
          data,
        } = await service.nest.collaboratorControllerFindDataForExcel();
        this.collaboratorExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteCollaborator(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.collaboratorControllerUpdate(
          payload,
          { deletedAt: new Date() }
        );
        this.error = null;
        this.fetchCollaborators({
          take: this.collaboratorPagination.take,
          skip: this.collaboratorPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteCollaborator(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.collaboratorControllerDelete(
          payload
        );
        this.collaboratorList = this.collaboratorList.filter(
          (collaborator) => collaborator.id !== data.id
        );
        this.collaboratorPagination.total--;
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
    async editCollaborator(payload: {
      id: string;
      data?: CollaboratorUpdateInput;
    }) {
      this.isLoading = true;
      try {
        const editCollaboratorData: CollaboratorUpdateInput =
          payload.data ?? this.collaborator;
        editCollaboratorData.user =
          editCollaboratorData.user && editCollaboratorData.user.id?.length > 0
            ? editCollaboratorData.user
            : undefined;
        editCollaboratorData.project =
          editCollaboratorData.project &&
          editCollaboratorData.project.id?.length > 0
            ? editCollaboratorData.project
            : undefined;
        const { data } = await service.nest.collaboratorControllerUpdate(
          payload.id,
          editCollaboratorData
        );
        this.collaboratorList = this.collaboratorList.map((item) =>
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
      async editManyCollaborator(payload: { data: CollaboratorUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.nest.collaboratorControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.collaboratorList = this.collaboratorList.map((item) =>
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

    async getCollaboratorById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.collaboratorControllerFindOne(
          payload
        );
        this.collaborator = {
          ...data,
          user: data.user ? data.user : { id: "" },
          project: data.project ? data.project : { id: "" },
        };
        this.error = null;
      } catch (err: any) {
        this.resetCollaborator();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createCollaborator(payload?: { data: CollaboratorCreateInput }) {
      this.isLoading = true;
      try {
        const createCollaboratorData: CollaboratorCreateInput =
          payload?.data ?? (this.collaborator as CollaboratorCreateInput);
        createCollaboratorData.user =
          createCollaboratorData.user &&
          createCollaboratorData.user.id?.length > 0
            ? createCollaboratorData.user
            : undefined;
        createCollaboratorData.project =
          createCollaboratorData.project &&
          createCollaboratorData.project.id?.length > 0
            ? createCollaboratorData.project
            : undefined;
        const { data } = await service.nest.collaboratorControllerCreate(
          createCollaboratorData
        );
        this.collaboratorList = [...this.collaboratorList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyCollaborator(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.collaboratorControllerCreateMany(
          payload
        );
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetCollaborator() {
      this.$reset();
    },
    disposeCollaborator() {
      this.$dispose();
    },
  },
});
