using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using ProjetoFinal_MVC.Models.ViewModels;
using ProjetoFinal_MVC.Models.InputModels;

namespace ProjetoFinal_MVC.Controllers
{
    public class TurmasController : Controller
    {
        private const string BaseApiUrl = "https://localhost:7126/api/Turmas";

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

        // GET Listar todas as turmas.
        public async Task<IActionResult> Index()
        {
            using var client = CreateHttpClient(); 
            try
            {
                var json = await client.GetStringAsync(BaseApiUrl);
                var turmas = JsonSerializer.Deserialize<List<TurmaViewModel>>(json, _jsonOptions);

                if (turmas != null)
                {
                    turmas = turmas
                        .OrderBy(t => t.AnoLetivo)
                        .ThenBy(t => t.Nome)
                        .ToList();
                }

                return View(turmas);
            }
            catch (HttpRequestException)
            {
                ViewBag.ErroApi = "Não foi possível conectar ou obter a lista de turmas da API.";
                return View(new List<TurmaViewModel>());
            }
        }

        // GET para exibir o formulário
        public IActionResult Cadastrar()
        {
            return View();
        }

        //POST para enviar o cadastro para a API
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Cadastrar(TurmaInputModel turmaInput)
        {
            if (!ModelState.IsValid)
            {
                return View(turmaInput);
            }

            using var client = CreateHttpClient();
            try
            {
                var json = JsonSerializer.Serialize(turmaInput);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(BaseApiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    return RedirectToAction("Index");
                }
                else
                {
                    ModelState.AddModelError(string.Empty, $"Erro ao cadastrar turma. Código: {response.StatusCode}");
                    return View(turmaInput);
                }
            }
            catch (Exception)
            {
                ModelState.AddModelError(string.Empty, "Erro de comunicação com a API.");
                return View(turmaInput);
            }
        }

        [HttpGet]
        private async Task<List<TurmaViewModel>> GetAllTurmasAsync()
        {
            using var client = CreateHttpClient();
            try
            {
                var response = await client.GetAsync(BaseApiUrl);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<TurmaViewModel>>(json, _jsonOptions)?
                                       .OrderBy(t => t.AnoLetivo)
                                       .ThenBy(t => t.Nome)
                                       .ToList() ?? new List<TurmaViewModel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar turmas: {ex.Message}");
                return new List<TurmaViewModel>();
            }
        }
    }
}