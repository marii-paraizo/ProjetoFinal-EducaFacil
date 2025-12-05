using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using ProjetoFinal_MVC.Models.ViewModels;
using ProjetoFinal_MVC.Models.InputModels;

namespace ProjetoFinal_MVC.Controllers
{
    public class NotasController : Controller
    {
        private const string BaseApiUrl = "https://localhost:7126/api/Notas";
        private const string BaseApiUrlPresencas = "https://localhost:7126/api/Presencas";

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

        // Exibe notas e presenças (base da página do aluno)(GET)
        public async Task<IActionResult> Index(Guid idAluno, string nomeAluno)
        {
            if (idAluno == Guid.Empty || string.IsNullOrEmpty(nomeAluno))
            {
                TempData["Erro"] = "ID do Aluno ou Nome não fornecido.";
                return RedirectToAction("Index", "Turmas");
            }

            ViewBag.IdAluno = idAluno;
            ViewBag.NomeAluno = nomeAluno;
            ViewBag.BaseApiUrlNotas = BaseApiUrl;

            List<NotaViewModel> notas = new List<NotaViewModel>();

            using var client = CreateHttpClient();
            try
            {
                var responsePresencas = await client.GetAsync($"{BaseApiUrlPresencas}/aluno/{idAluno}/resumo");

                if (responsePresencas.IsSuccessStatusCode)
                {
                    var jsonPresencas = await responsePresencas.Content.ReadAsStringAsync();

                    using (JsonDocument doc = JsonDocument.Parse(jsonPresencas))
                    {
                        var root = doc.RootElement;


                        if (root.TryGetProperty("aulasTotais", out JsonElement total) && total.ValueKind == JsonValueKind.Number)
                            ViewBag.AulasTotais = total.GetInt32();

                        if (root.TryGetProperty("faltas", out JsonElement faltas) && faltas.ValueKind == JsonValueKind.Number)
                            ViewBag.Faltas = faltas.GetInt32();

                        if (root.TryGetProperty("presencaPercentual", out JsonElement porcentagem) && porcentagem.ValueKind == JsonValueKind.Number)
                            ViewBag.PorcentagemPresenca = porcentagem.GetDouble();
                    }
                }

                var responseNotas = await client.GetAsync($"{BaseApiUrl}/aluno/{idAluno}");

                if (responseNotas.IsSuccessStatusCode)
                {
                    if (responseNotas.StatusCode == System.Net.HttpStatusCode.NoContent)
                    {
                    }
                    else
                    {
                        var jsonNotas = await responseNotas.Content.ReadAsStringAsync();
                        notas = JsonSerializer.Deserialize<List<NotaViewModel>>(jsonNotas, _jsonOptions);
                    }
                }
                else
                {
                    var responseBody = await responseNotas.Content.ReadAsStringAsync();
                    ViewBag.ErroApi = $"Erro na API de Notas. Status: {responseNotas.StatusCode}. Detalhe: {responseBody}";
                }

                return View(notas);
            }
            catch (Exception ex)
            {
                ViewBag.ErroApi = $"Erro de comunicação ao listar notas: {ex.Message.Substring(0, Math.Min(ex.Message.Length, 150))}...";
                return View(notas);
            }
        }

        // exibir o formulário de Adicionar Nota (Simples, GET)
        [HttpGet]
        public IActionResult Adicionar(Guid idAluno, string nomeAluno)
        {
            if (idAluno == Guid.Empty || string.IsNullOrEmpty(nomeAluno))
            {
                TempData["Erro"] = "ID do Aluno ou Nome não fornecido.";
                return RedirectToAction("Index", "Turmas");
            }

            ViewBag.IdAluno = idAluno;
            ViewBag.NomeAluno = nomeAluno;

            var model = new NotaInputModel { IdAluno = idAluno, DataAvaliacao = DateOnly.FromDateTime(DateTime.Now) };
            return View(model);
        }

        // enviar a nova nota para a API (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Adicionar(NotaInputModel notaInput)
        {
            string nomeAluno = Request.Form["NomeAluno"];

            if (!ModelState.IsValid)
            {
                ViewBag.IdAluno = notaInput.IdAluno;
                ViewBag.NomeAluno = nomeAluno;
                return View(notaInput);
            }

            using var client = CreateHttpClient();
            try
            {
                var json = JsonSerializer.Serialize(notaInput);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{BaseApiUrl}/adicionar", content);

                if (response.IsSuccessStatusCode)
                {
                    TempData["Sucesso"] = "Nota adicionada com sucesso!";
                    return RedirectToAction("Index", new { idAluno = notaInput.IdAluno, nomeAluno = nomeAluno });
                }
                else
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    ModelState.AddModelError(string.Empty, $"Erro ao adicionar nota. Detalhe: {responseBody.Replace("\n", " ")}");

                    ViewBag.IdAluno = notaInput.IdAluno;
                    ViewBag.NomeAluno = nomeAluno;
                    return View(notaInput);
                }
            }
            catch (Exception)
            {
                ModelState.AddModelError(string.Empty, "Erro de comunicação com a API ao adicionar nota.");
                ViewBag.IdAluno = notaInput.IdAluno;
                ViewBag.NomeAluno = nomeAluno;
                return View(notaInput);
            }
        }
    }
}