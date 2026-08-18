document.addEventListener("DOMContentLoaded", function() {
 
  function mudarFundo(imagem) {
    document.body.style.backgroundImage = `url('${imagem}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

 
  document.getElementById('vote-artista-form')?.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const form = event.target;
    const selectedOption = form.querySelector('input[name="choice"]:checked');  

    if (selectedOption) {
      const artistName = selectedOption.value; 
      const confirmVote = confirm(`Você confirma seu voto em ${artistName}?`);
      if (confirmVote) {
        
        form.submit();
      }
    } else {
      alert('Por favor, selecione uma opção antes de votar.');
    }
  });

 
  
   document.getElementById('login-form')?.addEventListener('submit', async function(event) {
    event.preventDefault(); 

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
        localStorage.setItem("user", username); 
        window.location.href = '/vote'; 
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
  async function handleVote(event, voteType) {
    event.preventDefault();

    const selectedOption = document.getElementById(`${voteType}-option`).value;
    const user = localStorage.getItem("user");

    
    if (localStorage.getItem(`voted-${voteType}-${user}`)) {
      alert("Você já votou! Redirecionando para os resultados...");
      window.location.href = '/vote_results.html';
      return;
    }

    
    localStorage.setItem(`voted-${voteType}-${user}`, selectedOption);

    try {
      
      await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, vote: selectedOption })
      });

      alert("Voto registrado com sucesso!");

      
      if (voteType === 'vote') {
        window.location.href = '/album'; 
      } else if (voteType === 'album') {
        window.location.href = '/musica'; 
      } else if (voteType === 'musica') {
        window.location.href = '/vote_results'; /
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
        form.action = '/album'; 
        form.submit(); 
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
        form.action = '/album'; 
        form.submit();
      }
    } else {
      alert('Por favor, selecione um artista antes de votar.');
    }
  });

  document.getElementById('vote-musica-form')?.addEventListener('submit', function(event) {
    handleVote(event, 'musica');
  });

  
  document.getElementById('login-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (localStorage.getItem("isLoggedIn")) {
      window.location.href = "/vote";
    } else {
      window.location.href = "/login.html"; 
    }
  });

  document.getElementById('cadastro-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    mudarFundo('/static/imagens/gatozoiudo.jpg');
    setTimeout(() => {
      window.location.href = "/register.html"; 
    }, 100);
  });


  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("vote-artista-form");
    const buttons = form.querySelectorAll(".vote-btn");
  
    buttons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault(); 
        const artist = button.value; 
        
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
      event.preventDefault(); 

      const albumName = button.value; 
      const confirmVote = confirm(`Você confirma seu voto em "${albumName}"?`);

      if (confirmVote) {
        const form = document.getElementById('vote-album-form');
        form.action = `/musica?album=${encodeURIComponent(albumName)}`; 
        form.submit(); 
      }
    });
  });

  

  
