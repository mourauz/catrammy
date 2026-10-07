import os
import bcrypt
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')

app.secret_key = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    # 'artist', 'album' ou 'song' — um voto por categoria por usuário.
    category = db.Column(db.String(20), nullable=False)
    choice = db.Column(db.String(100), nullable=False)
    voted_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('votes', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'category', name='unique_user_category'),
    )


with app.app_context():
    db.create_all()


# Listas de opções de cada etapa da votação, com uma bio curta para o hover.
ARTISTS = [
    {'name': 'Billie Eilish', 'image': 'billie.png',
     'bio': 'Cantora e compositora pop/alternativa, conhecida pelo estilo intimista e produção minimalista.'},
    {'name': 'Travis Scott', 'image': 'travis.jpg',
     'bio': 'Rapper e produtor de Houston, referência do trap moderno e de shows com forte apelo visual.'},
    {'name': 'The Weeknd', 'image': 'the_weeknd.jpeg',
     'bio': 'Cantor canadense que mistura R&B, pop e synth-pop em composições atmosféricas.'},
    {'name': 'Tyler, The Creator', 'image': 'tyler.png',
     'bio': 'Rapper, produtor e multi-instrumentista, conhecido pela versatilidade entre hip-hop, soul e jazz.'},
    {'name': 'Taylor Swift', 'image': 'taylor.jpg',
     'bio': 'Cantora e compositora que transita entre pop, country e folk, com forte foco em narrativa.'},
    {'name': 'Rihanna', 'image': 'rihanna.jpg',
     'bio': 'Cantora de Barbados com carreira marcada por pop, R&B e dancehall.'},
    {'name': 'Clairo', 'image': 'clairo.jpg',
     'bio': 'Cantora e compositora do universo indie/bedroom pop, com produção caseira e intimista.'},
]

ALBUMS = [
    {'name': 'The Tortured Poets Department', 'image': 'tayloralbum.jpeg',
     'bio': 'Álbum confessional de Taylor Swift, com forte apelo lírico e produção introspectiva.'},
    {'name': 'Chromakopia', 'image': 'tyleralbum.jpeg',
     'bio': 'Álbum conceitual de Tyler, The Creator, misturando introspecção e experimentação sonora.'},
    {'name': 'Hit Me Hard and Soft', 'image': 'billiealbum.jpeg',
     'bio': 'Álbum de Billie Eilish que explora contrastes entre delicadeza e intensidade sonora.'},
    {'name': 'GNX', 'image': 'kendrickalbum.jpg',
     'bio': 'Álbum de Kendrick Lamar com forte identidade de West Coast e letras afiadas.'},
    {'name': 'Charm', 'image': 'clairoalbum.jpeg',
     'bio': 'Álbum de Clairo com instrumentação mais orgânica e influências de soft rock.'},
]

SONGS = [
    {'name': 'Birds Of a Feather', 'image': 'billiemusica.jpg',
     'bio': 'Um dos grandes hits do ano, com melodia envolvente e letra sobre amor e medo da perda.'},
    {'name': 'Juna', 'image': 'juna.jpeg',
     'bio': 'Faixa intimista de clima suave e produção minimalista.'},
    {'name': 'Nights Like This', 'image': 'nights_like_this.png',
     'bio': 'Faixa de R&B com atmosfera noturna e produção suave.'},
    {'name': 'The Emptiness Machine', 'image': 'linkpark.jpeg',
     'bio': 'Mistura de rock alternativo com elementos eletrônicos pesados.'},
    {'name': 'St Chroma', 'image': 'tylermusica.jpeg',
     'bio': 'Faixa de abertura de clima cinematográfico, com participação vocal convidada.'},
]

# Rótulo exibido no card e usado como categoria na votação.
CATEGORY_TAGS = {
    'artist': 'Artista do Ano',
    'album': 'Álbum do Ano',
    'song': 'Música do Ano',
}


def register_vote(category, options, next_endpoint, redirect_on_invalid):
    """Lógica compartilhada para registrar um voto em uma categoria
    (artista, álbum ou música) e seguir para a próxima etapa."""
    if 'user_id' not in session:
        flash('Por favor, faça login para acessar a votação.', 'warning')
        return redirect(url_for('login'))

    choice = request.form.get('choice')
    valid_choices = [item['name'] for item in options]

    if not choice or choice not in valid_choices:
        flash('Escolha inválida. Selecione uma das opções da lista.', 'error')
        return redirect(url_for(redirect_on_invalid))

    user_id = session['user_id']

    if Vote.query.filter_by(user_id=user_id, category=category).first():
        flash('Você já votou nessa categoria!', 'warning')
        return redirect(url_for(next_endpoint))

    new_vote = Vote(user_id=user_id, category=category, choice=choice)
    try:
        db.session.add(new_vote)
        db.session.commit()
        flash('Voto registrado com sucesso!', 'success')
    except Exception:
        db.session.rollback()
        flash('Erro ao registrar o voto. Por favor, tente novamente.', 'error')
        return redirect(url_for(redirect_on_invalid))

    return redirect(url_for(next_endpoint))


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not username or not password:
            flash('Todos os campos são obrigatórios!', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash('Usuário já existe!', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            flash('Email já registrado!', 'error')
            return redirect(url_for('register'))

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = User(username=username, email=email, password=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Cadastro realizado com sucesso! Por favor, faça login.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao cadastrar usuário: {str(e)}', 'error')
            return redirect(url_for('register'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('vote'))
        else:
            flash('Usuário ou senha inválidos.', 'error')
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/vote', methods=['GET', 'POST'])
def vote():
    if 'user_id' not in session:
        flash('Por favor, faça login para acessar a votação.', 'warning')
        return redirect(url_for('login'))

    if request.method == 'POST':
        return register_vote('artist', ARTISTS, 'album', 'vote')

    return render_template('vote.html', artists=ARTISTS, tag=CATEGORY_TAGS['artist'])


@app.route('/album', methods=['GET', 'POST'])
def album():
    if 'user_id' not in session:
        flash('Por favor, faça login para acessar a votação.', 'warning')
        return redirect(url_for('login'))

    if request.method == 'POST':
        return register_vote('album', ALBUMS, 'musica', 'album')

    return render_template('album.html', albums=ALBUMS, tag=CATEGORY_TAGS['album'])


@app.route('/musica', methods=['GET', 'POST'])
def musica():
    if 'user_id' not in session:
        flash('Por favor, faça login para acessar a votação.', 'warning')
        return redirect(url_for('login'))

    if request.method == 'POST':
        return register_vote('song', SONGS, 'vote_results', 'musica')

    return render_template('musica.html', songs=SONGS, tag=CATEGORY_TAGS['song'])


@app.route('/vote_results')
def vote_results():
    artist_votes = Vote.query.filter_by(category='artist').order_by(Vote.voted_at.desc()).all()
    album_votes = Vote.query.filter_by(category='album').order_by(Vote.voted_at.desc()).all()
    song_votes = Vote.query.filter_by(category='song').order_by(Vote.voted_at.desc()).all()
    return render_template(
        'vote_results.html',
        artist_votes=artist_votes,
        album_votes=album_votes,
        song_votes=song_votes,
    )


@app.route('/logout')
def logout():
    session.clear()
    flash('Você foi desconectado', 'info')
    return redirect(url_for('index'))


@app.route('/favicon.ico')
def favicon():
    return redirect(url_for('static', filename='imagens/gato-preto.ico'))


if __name__ == '__main__':
    app.run(debug=True)
