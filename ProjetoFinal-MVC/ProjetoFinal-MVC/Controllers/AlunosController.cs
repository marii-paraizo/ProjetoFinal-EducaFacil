using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using ProjetoFinal_MVC.Models.ViewModels;
using ProjetoFinal_MVC.Models.InputModels;

namespace ProjetoFinal_MVC.Controllers
{
    public class AlunosController : Controller
    {
        private const string BaseApiUrl = "https://localhost:7126/api/Alunos";
        private const string BaseApiUrlTurmas = "https://localhost:7126/api/Turmas";

        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        private HttpClient CreateHttpClient()
        {
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
            };
            return new HttpClient(handler);
        }

        private async Task<bool> LoadTurmaData(Guid idTurma)
        {
            if (idTurma == Guid.Empty)
            {
                ViewBag.IdTurma = Guid.Empty;
                ViewBag.NomeTurma = "Turma Inválida";
                return false;
            }

            ViewBag.IdTurma = idTurma;
            ViewBag.NomeTurma = "Turma Desconhecida";

            using var client = CreateHttpClient();
            try
            {
                var responseTurma = await client.GetAsync($"{BaseApiUrlTurmas}/{idTurma}");

                if (responseTurma.IsSuccessStatusCode)
                {
                    var jsonTurma = await responseTurma.Content.ReadAsStringAsync();
                    var turma = JsonSerializer.Deserialize<TurmaViewModel>(jsonTurma, _jsonOptions);

                    ViewBag.Turma = turma;
                    ViewBag.NomeTurma = turma.Nome;
                    return true;
                }
                else
                {
                    ViewBag.ErroTurma = $"Turma não encontrada ou erro na API de Turmas. Status: {responseTurma.StatusCode}";
                    ViewBag.IdTurma = idTurma;
                    ViewBag.NomeTurma = "Turma Desconhecida";
                    return false;
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErroTurma = $"Erro de comunicação ao carregar dados da turma: {ex.Message.Substring(0, Math.Min(ex.Message.Length, 80))}...";
                return false;
            }
        }

        // 1. Ação Index (GET): Listar todos os alunos de uma turma
        public async Task<IActionResult> Index(Guid idTurma, string termoBusca)
        {
            if (idTurma == Guid.Empty)
            {
                TempData["Erro"] = "ID da Turma não fornecido.";
                return RedirectToAction("Index", "Turmas");
            }

            List<AlunoViewModel> alunos = new List<AlunoViewModel>();

            await LoadTurmaData(idTurma);

            using var client = CreateHttpClient();
            try
            {
                var url = $"{BaseApiUrl}/PorTurma/{idTurma}?termo={{Uri.EscapeDataString(termoBusca ?? \"\")}}";

                if (!string.IsNullOrEmpty(termoBusca))
                {
                    url += $"?termo={Uri.EscapeDataString(termoBusca)}";
                }

                var responseAlunos = await client.GetAsync(url);
                if (responseAlunos.IsSuccessStatusCode)
                {
                    if (responseAlunos.StatusCode == System.Net.HttpStatusCode.NoContent)
                    {
                    }
                    else
                    {
                        var jsonAlunos = await responseAlunos.Content.ReadAsStringAsync();
                        alunos = JsonSerializer.Deserialize<List<AlunoViewModel>>(jsonAlunos, _jsonOptions);
                    }
                }
                else
                {
                    var responseBody = await responseAlunos.Content.ReadAsStringAsync();

                    if (!string.IsNullOrEmpty(responseBody))
                    {
                        ViewBag.ErroApi = $"Erro na API. Status: {responseAlunos.StatusCode}. Detalhe: {responseBody}";
                    }
                    else
                    {
                        ViewBag.ErroApi = $"Não foi possível obter a lista de alunos da API. Status: {responseAlunos.StatusCode}";
                    }
                }
                ViewBag.TermoBusca = termoBusca;

                return View(alunos ?? new List<AlunoViewModel>());
            }
            catch (Exception ex)
            {
                ViewBag.ErroApi = $"Erro de comunicação (DETALHE): {ex.Message.Substring(0, Math.Min(ex.Message.Length, 150))}...";
                return View(alunos);
            }
        }

        // 2. Ação Cadastrar (GET)
        public async Task<IActionResult> Cadastrar(Guid idTurma)
        {
            if (idTurma == Guid.Empty || !await LoadTurmaData(idTurma))
            {
                TempData["Erro"] = "ID da Turma inválido ou turma não encontrada/acessível.";
                return RedirectToAction("Index", "Turmas");
            }

            var model = new AlunoInputModel { IdTurma = idTurma };
            return View(model);
        }

        // 3. Ação Cadastrar (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Cadastrar(AlunoInputModel alunoInput)
        {
            await LoadTurmaData(alunoInput.IdTurma);

            if (!ModelState.IsValid)
            {
                return View(alunoInput);
            }

            using var client = CreateHttpClient();
            try
            {
                var json = JsonSerializer.Serialize(alunoInput);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(BaseApiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    TempData["Sucesso"] = "Aluno cadastrado com sucesso!";
                    return RedirectToAction("Index", new { idTurma = alunoInput.IdTurma });
                }
                else
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    ModelState.AddModelError(string.Empty, $"Erro ao cadastrar aluno. Detalhe: {responseBody.Replace("\n", " ").Substring(0, Math.Min(responseBody.Length, 100))}...");
                    return View(alunoInput);
                }
            }
            catch (Exception)
            {
                ModelState.AddModelError(string.Empty, "Erro de comunicação com a API.");
                return View(alunoInput);
            }
        }

        // 4. Ação Editar (GET)
        [HttpGet]
        public async Task<IActionResult> Editar(Guid id)
        {
            if (id == Guid.Empty)
            {
                TempData["Erro"] = "ID do Aluno não fornecido.";
                return RedirectToAction("Index", "Turmas");
            }

            using var client = CreateHttpClient();
            try
            {
                var response = await client.GetAsync($"{BaseApiUrl}/{id}");
                if (!response.IsSuccessStatusCode)
                {
                    TempData["Erro"] = "Aluno não encontrado ou erro na API.";
                    return RedirectToAction("Index", "Turmas"); 
                }

                var json = await response.Content.ReadAsStringAsync();
                var alunoVM = JsonSerializer.Deserialize<AlunoViewModel>(json, _jsonOptions);

                await LoadTurmaData(alunoVM.IdTurma);
                
                return View(alunoVM);
            }
            catch (Exception)
            {
                TempData["Erro"] = "Erro de comunicação com a API ao buscar aluno.";
                return RedirectToAction("Index", "Turmas");
            }
        }

        // 5. Ação Editar (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConfirmarEdicao(AlunoInputModel alunoInput)
        {
            await LoadTurmaData(alunoInput.IdTurma);

            if (alunoInput.IdAluno == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "ID do aluno não encontrado.");
                return View(alunoInput);
            }

            if (!ModelState.IsValid)
            {
                return View(alunoInput);
            }

            using var client = CreateHttpClient();
            try
            {
                var json = JsonSerializer.Serialize(alunoInput);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PutAsync($"{BaseApiUrl}/{alunoInput.IdAluno}", content);

                if (response.IsSuccessStatusCode)
                {
                    TempData["Sucesso"] = "Aluno(a) atualizado(a) com sucesso!";
                    return RedirectToAction("Index", "Alunos", new { idTurma = alunoInput.IdTurma });
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    ModelState.AddModelError(string.Empty, "Erro: Aluno não encontrado na API.");
                    return View(alunoInput);
                }
                else
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    ModelState.AddModelError(string.Empty, $"Erro ao atualizar aluno. Detalhe: {responseBody.Replace("\n", " ")}");
                    return View(alunoInput);
                }
            }
            catch (Exception)
            {
                ModelState.AddModelError(string.Empty, "Erro de comunicação ao tentar atualizar o aluno.");
                return View(alunoInput);
            }
        }
    }
}