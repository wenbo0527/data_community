"""
数据处理器模块
负责处理样本文件、生成统计数据和质量分析
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')


class DataProcessor:
    """
    数据处理器类
    负责样本数据的读取、清洗、统计和质量分析
    """
    
    def __init__(self):
        """初始化数据处理器"""
        self.supported_formats = ['.xlsx', '.csv', '.xls']
    
    def process_sample_file(self, file_path: str) -> pd.DataFrame:
        """
        处理样本文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            处理后的DataFrame
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        if file_path.suffix.lower() not in self.supported_formats:
            raise ValueError(f"不支持的文件格式: {file_path.suffix}")
        
        # 读取数据
        if file_path.suffix.lower() == '.csv':
            df = pd.read_csv(file_path, encoding='utf-8')
        else:
            df = pd.read_excel(file_path)
        
        # 数据清洗
        df = self._clean_data(df)
        
        # 数据验证
        self._validate_data(df)
        
        return df
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """数据清洗"""
        # 删除空值较多的列
        threshold = len(df) * 0.7
        df = df.dropna(thresh=threshold, axis=1)
        
        # 填充缺失值
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                df[col] = df[col].fillna(0)
            else:
                df[col] = df[col].fillna('')
        
        # 去除重复行
        df = df.drop_duplicates()
        
        return df
    
    def _validate_data(self, df: pd.DataFrame):
        """数据验证"""
        if df.empty:
            raise ValueError("数据为空")
        
        if len(df.columns) < 2:
            raise ValueError("数据列数过少")
    
    def generate_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        生成统计数据
        
        Args:
            df: 处理后的DataFrame
            
        Returns:
            统计数据字典
        """
        stats = {
            "basic_info": self._get_basic_info(df),
            "numeric_stats": self._get_numeric_stats(df),
            "categorical_stats": self._get_categorical_stats(df),
            "quality_metrics": self._get_quality_metrics(df),
            "sample_data": self._get_sample_data(df)
        }
        
        return stats
    
    def _get_basic_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """获取基础信息"""
        return {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "memory_usage": df.memory_usage(deep=True).sum(),
            "data_types": df.dtypes.to_dict()
        }
    
    def _get_numeric_stats(self, df: pd.DataFrame) -> Dict[str, Any]:
        """获取数值统计"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) == 0:
            return {}
        
        stats = {}
        for col in numeric_cols:
            stats[col] = {
                "mean": float(df[col].mean()),
                "median": float(df[col].median()),
                "std": float(df[col].std()),
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "q1": float(df[col].quantile(0.25)),
                "q3": float(df[col].quantile(0.75)),
                "skewness": float(df[col].skew()),
                "kurtosis": float(df[col].kurtosis())
            }
        
        return stats
    
    def _get_categorical_stats(self, df: pd.DataFrame) -> Dict[str, Any]:
        """获取分类统计"""
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        if len(categorical_cols) == 0:
            return {}
        
        stats = {}
        for col in categorical_cols:
            value_counts = df[col].value_counts()
            stats[col] = {
                "unique_count": int(df[col].nunique()),
                "top_value": str(value_counts.index[0]) if len(value_counts) > 0 else None,
                "top_frequency": int(value_counts.iloc[0]) if len(value_counts) > 0 else 0,
                "value_distribution": value_counts.head(10).to_dict()
            }
        
        return stats
    
    def _get_quality_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """获取数据质量指标"""
        quality = {
            "completeness": {},
            "consistency": {},
            "accuracy": {}
        }
        
        # 完整性
        for col in df.columns:
            null_count = df[col].isnull().sum()
            completeness = 1 - (null_count / len(df))
            quality["completeness"][col] = {
                "null_count": int(null_count),
                "completeness_rate": float(completeness)
            }
        
        # 一致性检查
        for col in df.columns:
            if df[col].dtype == 'object':
                # 检查格式一致性
                format_consistency = self._check_format_consistency(df[col])
                quality["consistency"][col] = format_consistency
        
        # 准确性检查
        quality["accuracy"] = self._check_data_accuracy(df)
        
        return quality
    
    def _check_format_consistency(self, series: pd.Series) -> Dict[str, Any]:
        """检查格式一致性"""
        # 简单的格式检查示例
        patterns = {
            "email": r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            "phone": r'^\d{11}$|^\d{3}-\d{4}-\d{4}$',
            "date": r'^\d{4}-\d{2}-\d{2}$'
        }
        
        results = {}
        for pattern_name, pattern in patterns.items():
            matches = series.astype(str).str.match(pattern, na=False)
            results[pattern_name] = {
                "match_rate": float(matches.sum() / len(series)),
                "match_count": int(matches.sum()),
                "total_count": int(len(series))
            }
        
        return results
    
    def _check_data_accuracy(self, df: pd.DataFrame) -> Dict[str, Any]:
        """检查数据准确性"""
        accuracy = {}
        
        # 数值范围检查
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            values = df[col]
            accuracy[col] = {
                "negative_count": int((values < 0).sum()),
                "zero_count": int((values == 0).sum()),
                "outlier_count": int(self._detect_outliers(values))
            }
        
        return accuracy
    
    def _detect_outliers(self, series: pd.Series) -> int:
        """检测异常值"""
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        return int(((series < lower_bound) | (series > upper_bound)).sum())
    
    def _get_sample_data(self, df: pd.DataFrame, n: int = 10) -> Dict[str, Any]:
        """获取样本数据"""
        return {
            "head": df.head(n).to_dict("records"),
            "tail": df.tail(n).to_dict("records"),
            "random": df.sample(min(n, len(df))).to_dict("records")
        }
    
    def get_data_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """获取数据摘要"""
        stats = self.generate_statistics(df)
        
        summary = {
            "overview": {
                "total_samples": stats["basic_info"]["total_rows"],
                "total_variables": stats["basic_info"]["total_columns"],
                "data_size_mb": round(stats["basic_info"]["memory_usage"] / (1024 * 1024), 2)
            },
            "numeric_summary": {
                "total_numeric_vars": len(stats["numeric_stats"]),
                "total_categorical_vars": len(stats["categorical_stats"])
            },
            "quality_summary": {
                "overall_completeness": np.mean([
                    col["completeness_rate"] 
                    for col in stats["quality_metrics"]["completeness"].values()
                ]),
                "total_null_values": sum([
                    col["null_count"] 
                    for col in stats["quality_metrics"]["completeness"].values()
                ])
            }
        }
        
        return summary