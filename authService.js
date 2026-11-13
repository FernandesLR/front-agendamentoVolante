const API_URL = "https://accursed-spooky-apparition-69gv757wv57vh9pg-8080.app.github.dev/clinica/auth"
// https://accursed-spooky-apparition-69gv757wv57vh9pg-8080.app.github.dev/clinica/auth/register

// Controle do modo
let currentMode = "login";



function setMode(mode) {
    currentMode = mode;

    const isRegister = mode === "register";

    const registerFields = document.getElementById("registerFields");
    const confirmPasswordContainer = document.getElementById("confirmPassword");
    const confirmPassword = document.getElementById("confirmarSenha");

    // Mostrar ou esconder campos de cadastro
    registerFields.classList.toggle("hidden", !isRegister);
    confirmPasswordContainer.classList.toggle("hidden", !isRegister);

    // Habilitar/desabilitar campos exclusivos do cadastro
    registerFields.querySelectorAll("input").forEach(input => {
        input.disabled = !isRegister;
        input.required = isRegister;
    });

    // Confirmação de senha
    confirmPassword.disabled = !isRegister;
    confirmPassword.required = isRegister;

    if (!isRegister) {
        confirmPassword.value = "";
    }

    // Título
    document.getElementById("formTitle").textContent =
        isRegister ? "Crie sua conta!" : "Bem-vindo de volta!";

    // Descrição
    document.getElementById("formDescription").textContent =
        isRegister
            ? "Preencha seus dados para cadastrar sua clínica."
            : "Entre com seus dados para acessar o sistema.";

    // Botão
    document.getElementById("submitBtn").textContent =
        isRegister ? "Criar minha conta" : "Entrar no sistema";

    // Abas
    document.getElementById("loginTab").className =
        isRegister
            ? "py-2 text-sm font-semibold rounded-md text-slate-500"
            : "py-2 text-sm font-semibold rounded-md bg-white text-slate-900 shadow-sm";

    document.getElementById("registerTab").className =
        isRegister
            ? "py-2 text-sm font-semibold rounded-md bg-white text-slate-900 shadow-sm"
            : "py-2 text-sm font-semibold rounded-md text-slate-500";

    // Autocomplete da senha
    document.getElementById("senha").autocomplete =
        isRegister ? "new-password" : "current-password";

    // Garantir que os campos comuns permaneçam habilitados
    document.getElementById("email").disabled = false;
    document.getElementById("email").required = true;

    document.getElementById("senha").disabled = false;
    document.getElementById("senha").required = true;
}

// Iniciar sempre no modo login
document.addEventListener("DOMContentLoaded", () => {
    setMode("login");
});



// Controle do tipo de acesso
let userRole = "clinic";

function setRole(role) {
    userRole = role;

    const isClinic = role === "clinic";

    document.getElementById("clinicBtn").className =
        isClinic
            ? "border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-lg p-3 text-sm font-semibold"
            : "border border-slate-200 text-slate-600 rounded-lg p-3 text-sm font-semibold hover:bg-slate-50";

    document.getElementById("adminBtn").className =
        !isClinic
            ? "border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-lg p-3 text-sm font-semibold"
            : "border border-slate-200 text-slate-600 rounded-lg p-3 text-sm font-semibold hover:bg-slate-50";

    document.getElementById("adminNotice")
        .classList.toggle("hidden", isClinic);

    document.getElementById("registerTab").disabled = !isClinic;

    if (!isClinic) {
        setMode("login");
    }
}

// Validação básica de email
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Coleta dos dados do formulário
function coletarDadosCadastro() {

    const nome = document.getElementById("nome").value.trim();

    // Remove pontos, barras, hífens e outros caracteres
    const cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");

    const endereco = document.getElementById("endereco").value.trim();

    // Envia telefone somente com números
    const telefone = document.getElementById("telefone").value.replace(/\D/g, "");

    const email = document.getElementById("email").value.trim();

    const senha = document.getElementById("senha").value;

    const confirmarSenha = document.getElementById("confirmarSenha").value;

    // Validação da confirmação
    if (senha !== confirmarSenha) {
        throw new Error("As senhas não coincidem.");
    }

    if (senha.length < 5) {
        throw new Error("A senha deve possuir pelo menos 5 caracteres.");
    }

    if (cnpj.length !== 14) {
        throw new Error("O CNPJ deve possuir exatamente 14 números.");
    }

    // JSON correspondente ao RegisterRequestDTO
    return {
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        senha
    };
}

// Envio do formulário
document.getElementById("authForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const form = event.target;
    const button = document.getElementById("submitBtn");

    const isRegister = currentMode === "register";

    // Impede cadastro de administrador
    if (userRole === "admin" && isRegister) {
        alert("Cadastro administrativo não permitido.");
        return;
    }

    let dados;

    try {

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        if (!validarEmail(email)) {
            throw new Error("Informe um endereço de e-mail válido.");
        }

        if (isRegister) {

            // Coleta os seis campos do DTO
            dados = coletarDadosCadastro();

        } else {

            // Dados do login
            dados = {
                email,
                senha,
                role: userRole
            };

        }

    } catch (error) {

        alert(error.message);
        return;

    }

    try {

        button.disabled = true;
        button.textContent = "Aguarde...";

        const endpoint = isRegister
            ? "/register"
            : "/login";

        const response = await fetch(`${API_URL}${endpoint}`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dados)

        });

        // Evita erro caso o backend retorne resposta vazia
        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                resultado.message ||
                resultado.mensagem ||
                "Não foi possível realizar a operação."
            );
        }

        alert(resultado.message || "Operação realizada com sucesso!");

        if (isRegister) {

            form.reset();
            setMode("login");

        } else {

            console.log("Resposta do login:", resultado);

            // Ajustar conforme sua autenticação e resposta do backend.
            // window.location.href = "/dashboard.html";

        }

    } catch (error) {

        alert(error.message || "Erro ao conectar com o servidor.");

    } finally {

        button.disabled = false;

        button.textContent = currentMode === "register"
            ? "Criar minha conta"
            : "Entrar no sistema";

    }

});
