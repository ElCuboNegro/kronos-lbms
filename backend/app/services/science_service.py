class ScienceService:
    @staticmethod
    def calculate_molarity(target_molarity: float, volume_liters: float, molecular_weight: float) -> float:
        """Calcula la masa necesaria: masa = M * V * MW"""
        return target_molarity * volume_liters * molecular_weight

    @staticmethod
    def calculate_dilution_c1v1(c1: float, c2: float, v2: float) -> float:
        """Calcula V1 necesario para una dilución: V1 = (C2 * V2) / C1"""
        if c1 == 0:
            return 0
        return (c2 * v2) / c1

    @staticmethod
    def calculate_cell_viability(total_cells: int, dead_cells: int) -> float:
        """Calcula el porcentaje de viabilidad celular."""
        if total_cells == 0:
            return 0
        return (1 - (dead_cells / total_cells)) * 100
