import { AiModelUpdateInput, AiModelCreateInput, AiModel } from "./../../index";
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
const initialState: AiModel | AiModelCreateInput | AiModelUpdateInput = {
  name: "",
  type: "",
};
export const useAiModelStore = defineStore("aimodel-store", {
  state: () => {
    return {
      aimodelList: [] as Array<AiModel>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      aimodel: _.cloneDeep(initialState) as
        | AiModel
        | AiModelCreateInput
        | AiModelUpdateInput,
      aimodelExcelFile: "" as string,
      aimodelPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchAiModels(payload?: IPagination) {
      try {
        const { data } = await service.nest.aiModelControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.aimodelList = data.paginatedResult;

        this.aimodelList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.aimodelPagination = {
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
        this.aimodelList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelAiModels() {
      try {
        const { data } = await service.nest.aiModelControllerFindDataForExcel();
        this.aimodelExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteAiModel(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.aiModelControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchAiModels({
          take: this.aimodelPagination.take,
          skip: this.aimodelPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteAiModel(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.aiModelControllerDelete(payload);
        this.aimodelList = this.aimodelList.filter(
          (aimodel) => aimodel.id !== data.id
        );
        this.aimodelPagination.total--;
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
    async editAiModel(payload: { id: string; data?: AiModelUpdateInput }) {
      this.isLoading = true;
      try {
        const editAiModelData: AiModelUpdateInput =
          payload.data ?? this.aimodel;

        const { data } = await service.nest.aiModelControllerUpdate(
          payload.id,
          editAiModelData
        );
        this.aimodelList = this.aimodelList.map((item) =>
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
      async editManyAiModel(payload: { data: AiModelUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.nest.aiModelControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.aimodelList = this.aimodelList.map((item) =>
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

    async getAiModelById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.aiModelControllerFindOne(payload);
        this.aimodel = {
          ...data,
        };
        this.error = null;
      } catch (err: any) {
        this.resetAiModel();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createAiModel(payload?: { data: AiModelCreateInput }) {
      this.isLoading = true;
      try {
        const createAiModelData: AiModelCreateInput =
          payload?.data ?? (this.aimodel as AiModelCreateInput);

        const { data } = await service.nest.aiModelControllerCreate(
          createAiModelData
        );
        this.aimodelList = [...this.aimodelList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyAiModel(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.aiModelControllerCreateMany(payload);
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetAiModel() {
      this.$reset();
    },
    disposeAiModel() {
      this.$dispose();
    },
  },
});
