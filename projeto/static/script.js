document.addEventListener("DOMContentLoaded", function() {
  // Função para mudar o fundo do site
  function mudarFundo(imagem) {
    document.body.style.backgroundImage = `url('${imagem}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  // Votação de Artista com confirmação
  document.getElementById('vote-artista-form')?.addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o envio do formulário imediatamente
    const form = event.target;
    const selectedOption = form.querySelector('input[name="choice"]:checked');  // Obtém a opção selecionada

    if (selectedOption) {
      const artistName = selectedOption.value; // Nome do artista escolhido
      const confirmVote = confirm(`Você confirma seu voto em ${artistName}?`);
      if (confirmVote) {
        // Após confirmação, o voto é registrado e o usuário é redirecionado
        form.submit();
      }
    } else {
      alert('Por favor, selecione uma opção antes de votar.');
    }
  });

  // Formulário de login
   // Formulário de login
   document.getElementById('login-form')?.addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio do formulário

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", username); // Armazena o usuário logado
        window.location.href = '/vote'; // Redireciona para a página de votação
      } else {
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block';
        errorMessage.textContent = data.message;
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão, tente novamente.');
    }
  });
});
  // Registro de voto e redirecionamento
  async function handleVote(event, voteType) {
    event.preventDefault();

    const selectedOption = document.getElementById(`${voteType}-option`).value;
    const user = localStorage.getItem("user");

    // Verifica se o usuário já votou
    if (localStorage.getItem(`voted-${voteType}-${user}`)) {
      alert("Você já votou! Redirecionando para os resultados...");
      window.location.href = '/vote_results.html';
      return;
    }

    // Registra o voto no localStorage
    localStorage.setItem(`voted-${voteType}-${user}`, selectedOption);

    try {
      // Opcional: Envia o voto para o backend
      await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, vote: selectedOption })
      });

      alert("Voto registrado com sucesso!");

      // Redirecionamento conforme a etapa
      if (voteType === 'vote') {
        window.location.href = '/album'; // Redireciona para álbum após votar em artista
      } else if (voteType === 'album') {
        window.location.href = '/musica'; // Redireciona para música após votar em álbum
      } else if (voteType === 'musica') {
        window.location.href = '/vote_results'; // Redireciona para resultados após votar em música
      }
    } catch (error) {
      console.error('Erro ao registrar voto:', error);
      alert('Erro ao registrar voto. Tente novamente mais tarde.');
    }
  }

  document.getElementById('vote-artista-form')?.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target;
    const selectedOption = form.querySelector('input[name="choice"]:checked');

    if (selectedOption) {
      const artistName = selectedOption.value;
      const confirmVote = confirm(`Você confirma seu voto em ${artistName}?`);

      if (confirmVote) {
        // Redireciona para a página de álbum
        form.action = '/album'; // Define a nova rota
        form.submit(); // Envia o formulário
      }
    } else {
      alert('Por favor, selecione um artista antes de votar.');
    }
  });

  document.getElementById('vote-album-form')?.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target;
    const selectedOption = form.querySelector('input[name="choice"]:checked');

    if (selectedOption) {
      const albumName = selectedOption.value;
      const confirmVote = confirm(`Você confirma seu voto em ${albumName}?`);

      if (confirmVote) {
        // Redireciona para a página de álbum
        form.action = '/album'; // Define a nova rota
        form.submit(); // Envia o formulário
      }
    } else {
      alert('Por favor, selecione um artista antes de votar.');
    }
  });

  // Votação de Música
  document.getElementById('vote-musica-form')?.addEventListener('submit', function(event) {
    handleVote(event, 'musica');
  });

  // Outros eventos para botões (ex.: de cadastro e de login)
  document.getElementById('login-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    // Verifica se o usuário está logado
    if (localStorage.getItem("isLoggedIn")) {
      // Se o usuário já estiver logado, redireciona diretamente para a página de votação
      window.location.href = "/vote";
    } else {
      // Se não estiver logado, redireciona para a página de login
      window.location.href = "/login.html"; // Adapte o caminho conforme necessário
    }
  });

  document.getElementById('cadastro-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    mudarFundo('/static/imagens/gatozoiudo.jpg');
    setTimeout(() => {
      window.location.href = "/register.html"; // Redireciona para registro
    }, 100);
  });


  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("vote-artista-form");
    const buttons = form.querySelectorAll(".vote-btn");
  
    buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault(); // Previne o envio do formulário imediatamente
        const artist = button.value; // Obtém o valor do botão
        
        const confirmVote = confirm(`Você confirma seu voto em ${artist}?`);
          
        if (confirmVote) {
          form.action = `album?artist=${encodeURIComponent(artist)}`;
          form.submit();
        }
      });
    });
  });

  document.querySelectorAll('.vote-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault(); // Previne o envio do formulário imediatamente

      const albumName = button.value; // Nome do álbum clicado
      const confirmVote = confirm(`Você confirma seu voto em "${albumName}"?`);

      if (confirmVote) {
        // Atualiza a ação do formulário e submete
        const form = document.getElementById('vote-album-form');
        form.action = `/musica?album=${encodeURIComponent(albumName)}`; // Passa o álbum para a página de música
        form.submit(); // Envia o formulário
      }
    });
  });

  

  