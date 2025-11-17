Passo a passo para inicialização

Pré-Requisitos:
Docker, Maven Wrapper, JDK

1. Iniciar o container do docker:
docker run --name dev-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -e POSTGRES_DB=carteira_facil -p 5433:5432 -d postgres:latest

2. Iniciar o Spring Boot:
.\mvnw.cmd clean spring-boot:run -DskipTests

3. URL de acesso padrão:
http://localhost:8080

Comandos extras:

-Verificar tabela usuários:
docker exec -it dev-postgres psql -U postgres -d carteira_facil -c "SELECT id, nome, email, role, subscription_type FROM usuarios;"

-Tornar Usuário em Admin:
docker exec -it dev-postgres psql -U postgres -d carteira_facil -c "UPDATE usuarios SET role = 'ADMIN' WHERE email = 'seu_email@aqui.com';"

-Tornar usuário Free em Premium:
docker exec -it dev-postgres psql -U postgres -d carteira_facil -c "UPDATE usuarios SET subscription_type = 'PREMIUM' WHERE email = 'seu_email@aqui.com';"
