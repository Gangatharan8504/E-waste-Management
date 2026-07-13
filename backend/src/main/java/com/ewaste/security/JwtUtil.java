package com.ewaste.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}") private String secret;
    @Value("${app.jwt.expiration}") private long expiration;
    private Key getSigningKey() { return Keys.hmacShaKeyFor(secret.getBytes()); }
    public String generateToken(UserDetails ud) {
        return Jwts.builder().setClaims(new HashMap<>()).setSubject(ud.getUsername())
            .setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256).compact();
    }
    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }
    public boolean validateToken(String token, UserDetails ud) {
        return extractUsername(token).equals(ud.getUsername()) && !isTokenExpired(token);
    }
    private boolean isTokenExpired(String token) { return extractClaim(token, Claims::getExpiration).before(new Date()); }
    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody());
    }
}
