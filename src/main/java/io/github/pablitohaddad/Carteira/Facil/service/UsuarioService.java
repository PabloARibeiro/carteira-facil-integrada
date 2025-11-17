package io.github.pablitohaddad.Carteira.Facil.service;

import io.github.pablitohaddad.Carteira.Facil.dto.UsuarioCreateDTO;
import io.github.pablitohaddad.Carteira.Facil.dto.UsuarioUpdateDTO;
import io.github.pablitohaddad.Carteira.Facil.model.Usuario;
import io.github.pablitohaddad.Carteira.Facil.repository.UsuarioRepository;
import io.github.pablitohaddad.Carteira.Facil.repository.GastoRepository;
import io.github.pablitohaddad.Carteira.Facil.repository.GanhoRepository;
import io.github.pablitohaddad.Carteira.Facil.repository.RendaAtualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private GastoRepository gastoRepository;

    @Autowired
    private GanhoRepository ganhoRepository;

    @Autowired
    private RendaAtualRepository rendaAtualRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public Usuario criarUsuario(UsuarioCreateDTO dto) {
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dto.getNome());
        novoUsuario.setEmail(dto.getEmail());
        novoUsuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
        novoUsuario.setRole(io.github.pablitohaddad.Carteira.Facil.model.Role.CLIENT);
        novoUsuario.setSubscriptionType(io.github.pablitohaddad.Carteira.Facil.model.SubscriptionType.FREE);

        return usuarioRepository.save(novoUsuario);
    }

    public io.github.pablitohaddad.Carteira.Facil.dto.AdminSummaryDTO obterResumoAdmin() {
        var clientes = usuarioRepository.findAllByRole(io.github.pablitohaddad.Carteira.Facil.model.Role.CLIENT);

        long totalClientes = clientes.size();
        long free = clientes.stream()
                .filter(u -> u.getSubscriptionType() == io.github.pablitohaddad.Carteira.Facil.model.SubscriptionType.FREE)
                .count();
        long premium = clientes.stream()
                .filter(u -> u.getSubscriptionType() == io.github.pablitohaddad.Carteira.Facil.model.SubscriptionType.PREMIUM)
                .count();

        var summary = new io.github.pablitohaddad.Carteira.Facil.dto.AdminSummaryDTO();
        summary.setTotalClients(totalClientes);
        summary.setFreeCount(free);
        summary.setPremiumCount(premium);

        var publico = clientes.stream().map(u -> {
            var dto = new io.github.pablitohaddad.Carteira.Facil.dto.UsuarioPublicDTO();
            dto.setId(u.getId());
            dto.setNome(u.getNome());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole());
            dto.setSubscriptionType(u.getSubscriptionType());
            return dto;
        }).toList();

        summary.setClients(publico);
        return summary;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> atualizarUsuario(Long id, UsuarioUpdateDTO dto) {
        return usuarioRepository.findById(id).map(usuarioExistente -> {
            usuarioExistente.setNome(dto.getNome());
            if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
                usuarioExistente.setEmail(dto.getEmail());
            }
            if (dto.getNovaSenha() != null && !dto.getNovaSenha().isBlank()) {
                usuarioExistente.setSenhaHash(passwordEncoder.encode(dto.getNovaSenha()));
            }
            return usuarioRepository.save(usuarioExistente);
        });
    }

    @Transactional 
    public void deletar(Long id) {
        var usuario = usuarioRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Nao foi possivel encontrar esse usuario")
        );

        var gastos = gastoRepository.findByUsuarioId(id);
        gastoRepository.deleteAll(gastos);

        var ganhos = ganhoRepository.findByUsuarioId(id);
        ganhoRepository.deleteAll(ganhos);

        rendaAtualRepository.findByUsuarioId(id).ifPresent(renda -> {
            rendaAtualRepository.delete(renda);
        });

        usuarioRepository.delete(usuario);
    }
}