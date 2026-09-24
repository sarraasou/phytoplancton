<template>
  <div
    class="d-flex align-items-center justify-content-center"
    style="height: 100vh"
  >
    <!--Illustration-->
    <div class="d-flex bg-login">
      <div
        class="bgi-no-repeat bgi-position-x-center  bgi-position-center min-h-150px min-h-xl-500px mb-xl-10 test3 w-25"
        style="
          background-image: url('/png/bg1.png');
          z-index: 1;
          position: absolute;
          bottom: 5%;
          left: 0%;
          background-size: 80% 80% !important;
        "
      ></div>
      <div
        class="bgi-no-repeat bgi-position-x-center bgi-position-center min-h-200px min-h-xl-500px mb-xl-10 test3 w-25"
        style="
          background-image: url('/png/bg2.png');
          position: absolute;
          bottom: 2%;
          right: 0%;
          z-index: -1;
          background-size: 80% 80% !important;
        "
      ></div>
    </div>
    <!-- end Illustration-->
    <div class="w-lg-500px mb-10 mb-lg-3 mx-auto d-flex flex-column">
      <img alt="Logo" src="/png/logo.png" class="logo h-90px mb-lg-10" />
      <el-form ref="formRef" class="form" :model="form" :rules="rules">
        <el-card class="card">
          <div class="card-body p-lg-9">
            <h1 class="d-flex justify-content-center fw-bolder">
              {{ t("login.title") }}
            </h1>
            <div class="d-flex justify-content-center mt-5">
              <h4 class="text-gray-400 fw-bold">
                {{ t("login.newHere") }}?
                <router-link
                  data-test="signInFormRegisterLink"
                  :to="{ name: 'sign-up' }"
                  class="fw-bolder"
                  >{{ t("login.register") }}</router-link
                >
              </h4>
            </div>
            <div class="mt-lg-10">
              <el-form-item prop="email">
                <label class="form-label fw-bolder text-gray-900 fs-6">
                  {{ t("email") }}</label
                >
                <el-input
                  size="large"
                  type="email"
                  v-model="form.email"
                  data-test="signInFormEmail"
                />
              </el-form-item>
            </div>
            <div class="mt-lg-8">
              <div class="row justify-content-between form-label">
                <div class="col-6 text-start fw-bolder text-gray-900 fs-6">
                  {{ t("password") }}
                </div>
                <div class="col-6 text-end">
                  <router-link
                    data-test="signInFormForgotPasswordLink"
                    :to="{ name: 'email-reset-password' }"
                    >{{ t("forgotPassword") }} ?</router-link
                  >
                </div>
              </div>
              <el-form-item prop="password">
                <el-input
                  type="password"
                  size="large"
                  v-model="form.password"
                  data-test="signInFormPassword"
                  show-password
                />
              </el-form-item>
              <div class="menu-content">
                <label
                  class="form-check form-switch form-check-custom form-check-solid"
                >
                  <input
                    class="form-check-input w-30px h-20px"
                    type="checkbox"
                    value="1"
                    name="notifications"
                    v-model="form.rememberMe"
                  />
                  <span class="form-check-label text-muted fs-7">
                    Remember Me 
                  </span>
                </label>
              </div>
            </div>
            <div class="mt-lg-10 d-grid">
              <el-button
                data-test="signInSubmitButton"
                @click="onSubmit(formRef)"
                :loading="isLoading"
                type="primary"
                size="large"
                class="btn-lg mt-2"
                >{{ t("signIn") }}</el-button
              >
            </div>
            
            
          </div>
        </el-card>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts">
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";
import { ref, defineComponent } from "vue";
import { ElMessageBox } from "element-plus"
import { useRouter } from "vue-router"

import type { ElForm } from "element-plus";

let failMessage: string | null;

export default defineComponent({
  name: "sign-in",
  setup() {
    failMessage = t("messages.loginFailed");
    const authStore = useAuthStore();
    const router = useRouter()

    const isLoading = ref<boolean>(false);
    const form = ref({ email: "", password: "", rememberMe: false });
    const formRef = ref<InstanceType<typeof ElForm>>();
    const rules = ref({
      email: [
        {
          required: true,
          message: t("entityForm.validation.required"),
          trigger: "blur",
        },
        {
          type: "email",
          message: "L'adresse e-mail est invalide",
          trigger: ["blur", "change"],
        },
      ],
      password: [
        {
          required: true,
          message: t("entityForm.validation.required"),
          trigger: "blur",
        },
      ],
    });
    const providers = ref([
      { logo: "/svg/socialMediaLogos/google.svg", provider: "google" },
      { logo: "/svg/socialMediaLogos/linkedin.svg", provider: "linkedin" },
      { logo: "/svg/login/logo_github.svg", provider: "github" },
    ]);
    const loginWithProvider = async (Provider: any) => {
      try {
        await authStore.loginWithProvider(Provider);
      } catch (error) {
        console.log(error);
        Components.ElMessage.error(failMessage);
      }
    };



const login = async () => {
  isLoading.value = true
  try {
    await authStore.login(
      form.value.email,
      form.value.password,
      form.value.rememberMe
    )
    // ✅ Succès
    router.push({ name: 'home' })

  } catch (error: any) {
    const msg = error?.message || ''

    if (msg.includes('attente')) {
      ElMessageBox.alert(
        `<div style="text-align:center">
          <div style="font-size:40px;margin-bottom:12px">⏳</div>
          <p>${msg}</p>
        </div>`,
        'Compte en attente',
        { dangerouslyUseHTMLString: true, confirmButtonText: 'OK', center: true }
      )
    } else if (msg.includes('refus')) {
      ElMessageBox.alert(
        `<div style="text-align:center">
          <div style="font-size:40px;margin-bottom:12px">🚫</div>
          <p>${msg}</p>
        </div>`,
        'Accès refusé',
        { dangerouslyUseHTMLString: true, confirmButtonText: 'OK', center: true }
      )
    } else if (msg.includes('désactivé')) {
      ElMessageBox.alert(
        `<div style="text-align:center">
          <div style="font-size:40px;margin-bottom:12px">🔒</div>
          <p>${msg}</p>
        </div>`,
        'Compte désactivé',
        { dangerouslyUseHTMLString: true, confirmButtonText: 'OK', center: true }
      )
    } else {
      Components.ElMessage.error(failMessage)
    }

  } finally {
    isLoading.value = false
  }
}

    const onSubmit = async (
      formEl: InstanceType<typeof ElForm> | undefined
    ) => {
      if (!formEl) return;
      formEl.validate(async (valid) => {
        if (valid) {
          await login();
        } else {
          console.log("error submit!");
          return false;
        }
      });
    };
    return {
      t,
      form,
      onSubmit,
      isLoading,
      rules,
      formRef,
      loginWithProvider,
      providers,
    };
  },
});
</script>
<style lang="scss" scoped>
.el-input {
  background-color: #e9ecef;
}
:deep(.el-input__inner) {
  width: 100%;
}

@media (max-width: 1200px) {
  .bg-login {
    display: none !important;
  }
}


.provider_card {
  height: 50px;
  width: 50px;
  background: rgba(255, 255, 255, 0.11) !important;
}
.logo {
  cursor: pointer;
  padding: 0px 50px;
}

.line {
  border-top: 1px solid #7239ea;
  width: 45%;
}
</style>
