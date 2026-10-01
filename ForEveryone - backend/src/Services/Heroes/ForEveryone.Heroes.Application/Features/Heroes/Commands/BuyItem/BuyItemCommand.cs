using ForEveryone.SharedKernel;
using MediatR;

namespace Heroes.Application.Features.Heroes.Commands.BuyItem;

public record BuyItemCommand(Guid UserId, int ItemId) : IRequest<BuyItemResult>;

/// <summary>
/// Resultado de una compra. El mensaje es una clave de traduccion porque el
/// servidor no sabe en que idioma compra el jugador.
/// </summary>
public record BuyItemResult(LocalizedText Message, int CurrentGold);