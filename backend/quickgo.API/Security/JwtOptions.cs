namespace quickgo.API.Security;

public class JwtOptions {
    public string Key { get; set; } = string.Empty;
    /// <summary>Clave para cifrado JWE del token (min 16 chars). Si vacia, se deriva de Key.</summary>
    public string EncryptionKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "quickgo";
    public string Audience { get; set; } = "quickgo";
    public int ExpiraMinutos { get; set; } = 60;
}
