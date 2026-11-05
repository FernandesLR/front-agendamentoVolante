const API_URL = "http://localhost:8080/api";

// Controle das abas
function setMode(mode) {
    const isRegister = mode === "register";

    document.getElementById("registerFields")
        .classList.toggle("hidden", !isRegister);

    document.getElementById("confirmPassword")
        .classList.toggle("hidden", !isRegister);

    document.getElementById("formTitle").textContent =
        isRegister ? "Crie sua conta!" : "Bem-vindo de volta!";

    document.getElementById("formDescription").textContent =
        isRegister
            ? "Preencha seus dados para cadastrar sua clínica."
            : "Entre com seus dados para acessar o sistema.";

    document.getElementById("submitBtn").textContent =
        isRegister ? "Criar minha conta" : "Entrar no sistema";

    document.getElementById("loginTab").className =
        isRegister
            ? "py-2 text-sm font-semibold rounded-md text-slate-500"
            : "py-2 text-sm font-semibold rounded-md bg-white text-slate-900 shadow-sm";

    document.getElementById("registerTab").className =
        isRegister
            ? "py-2 text-sm font-semibold rounded-md bg-white text-slate-900 shadow-sm"
            : "py-2 text-sm font-semibold rounded-md text-slate-500";
}

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

// Verificação simples do formato do email
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Envio do formulário
document.getElementById("authForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const form = event.target;
    const button = document.getElementById("submitBtn");

    const isRegister =
        !document.getElementById("registerFields").classList.contains("hidden");

    const inputs = form.querySelectorAll("input");

    const email = inputs[isRegister ? 2 : 0].value.trim();
    const senha = inputs[isRegister ? 3 : 1].value;

    // Validação do email
    if (!validarEmail(email)) {
        alert("Informe um endereço de e-mail válido.");
        return;
    }

    // Administrador não pode se cadastrar
    if (userRole === "admin" && isRegister) {
        alert("Cadastro administrativo não permitido.");
        return;
    }

    // Dados da requisição
    let dados = {
        email: email,
        senha: senha
    };

    // Dados adicionais do cadastro
    if (isRegister) {

        dados.nome = inputs[0].value.trim();
        dados.cnpj = inputs[1].value.trim();

    }

    try {

        button.disabled = true;
        button.textContent = "Aguarde...";

        const endpoint = isRegister
            ? "/auth/register"
            : "/auth/login";

        const response = await fetch(`${API_URL}${endpoint}`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                ...dados,
                ...(isRegister ? {} : { role: userRole })
            })

        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(
                resultado.message || "Não foi possível realizar a operação."
            );
        }

        alert(resultado.message || "Operação realizada com sucesso!");

        if (isRegister) {

            form.reset();
            setMode("login");

        } else {

            // Ajustar conforme a resposta real do backend.
            console.log("Resposta do login:", resultado);

            // Redirecionamento após login.
            // window.location.href = "/dashboard.html";

        }

    } catch (error) {

        alert(error.message || "Erro ao conectar com o servidor.");

    } finally {

        button.disabled = false;

        button.textContent = isRegister
            ? "Criar minha conta"
            : "Entrar no sistema";

    }

});
